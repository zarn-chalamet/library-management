using Dapper;
using LibraryApi.Data;
using LibraryApi.Models;
using Microsoft.Data.Sqlite;

namespace LibraryApi.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<int> CreateUserAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;
    private readonly JsonDatabase _db;

    public UserRepository(IConfiguration config, JsonDatabase db)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")!;
        _db = db;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var conn = new SqliteConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @Email;", new { Email = email });
    }

    public async Task<int> CreateUserAsync(User user)
    {
        using var conn = new SqliteConnection(_connectionString);
        var id = await conn.ExecuteScalarAsync<int>(
            @"INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
              VALUES (@Username, @Email, @PasswordHash, @Role, @CreatedAt);
              SELECT last_insert_rowid();", user);

        await _db.SaveAsync();
        return id;
    }
}