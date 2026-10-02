using System.Text.Json;
using Dapper;
using LibraryApi.Models;
using Microsoft.Data.Sqlite;

namespace LibraryApi.Data;

public class JsonDatabase
{
    private readonly string _connectionString;
    private readonly string _dataPath;
    private SqliteConnection? _keepAlive;
    private static readonly SemaphoreSlim _lock = new(1, 1);
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public JsonDatabase(IConfiguration config, IWebHostEnvironment env)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")!;
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Json");
    }

    public void Initialize()
    {
        Directory.CreateDirectory(_dataPath);

        // Keep one connection open for the app's lifetime.
        // A shared in-memory SQLite DB is destroyed when its last connection closes.
        _keepAlive = new SqliteConnection(_connectionString);
        _keepAlive.Open();

        _keepAlive.Execute(@"
            CREATE TABLE IF NOT EXISTS Users (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Username TEXT NOT NULL,
                Email TEXT NOT NULL UNIQUE,
                PasswordHash TEXT NOT NULL,
                Role TEXT NOT NULL,
                CreatedAt TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS Books (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Author TEXT NOT NULL,
                ISBN TEXT NOT NULL UNIQUE,
                Genre TEXT NOT NULL,
                PublicationYear INTEGER NOT NULL,
                TotalCopies INTEGER NOT NULL,
                AvailableCopies INTEGER NOT NULL
            );");

        var users = Load<User>("users.json");
        if (users.Count == 0)
        {
            // First run: seed an admin account
            users.Add(new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@library.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin"
            });
        }
        var books = Load<Book>("books.json");

        _keepAlive.Execute(
            @"INSERT INTO Users (Id, Username, Email, PasswordHash, Role, CreatedAt)
              VALUES (@Id, @Username, @Email, @PasswordHash, @Role, @CreatedAt);", users);
        _keepAlive.Execute(
            @"INSERT INTO Books (Id, Title, Author, ISBN, Genre, PublicationYear, TotalCopies, AvailableCopies)
              VALUES (@Id, @Title, @Author, @ISBN, @Genre, @PublicationYear, @TotalCopies, @AvailableCopies);", books);

        SaveAsync().GetAwaiter().GetResult();
    }

    // Call this after every create / update / delete
    public async Task SaveAsync()
    {
        await _lock.WaitAsync();
        try
        {
            using var conn = new SqliteConnection(_connectionString);
            var users = await conn.QueryAsync<User>("SELECT * FROM Users;");
            var books = await conn.QueryAsync<Book>("SELECT * FROM Books;");
            await File.WriteAllTextAsync(Path.Combine(_dataPath, "users.json"), JsonSerializer.Serialize(users, JsonOpts));
            await File.WriteAllTextAsync(Path.Combine(_dataPath, "books.json"), JsonSerializer.Serialize(books, JsonOpts));
        }
        finally
        {
            _lock.Release();
        }
    }

    private List<T> Load<T>(string file)
    {
        var path = Path.Combine(_dataPath, file);
        if (!File.Exists(path)) return new List<T>();
        return JsonSerializer.Deserialize<List<T>>(File.ReadAllText(path), JsonOpts) ?? new List<T>();
    }
}