using Dapper;
using LibraryApi.Data;
using LibraryApi.Models;
using Microsoft.Data.Sqlite;

namespace LibraryApi.Repositories;

public interface IBookRepository
{
    Task<IEnumerable<Book>> GetAllAsync();
    Task<Book?> GetByIdAsync(int id);
    Task<bool> ExistsByIsbnAsync(string isbn, int? excludeId = null);
    Task<int> CreateAsync(Book book);
    Task<bool> UpdateAsync(Book book);
    Task<bool> DeleteAsync(int id);
}

public class BookRepository : IBookRepository
{
    private readonly string _connectionString;
    private readonly JsonDatabase _db;

    public BookRepository(IConfiguration config, JsonDatabase db)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")!;
        _db = db;
    }

    public async Task<IEnumerable<Book>> GetAllAsync()
    {
        using var conn = new SqliteConnection(_connectionString);
        return await conn.QueryAsync<Book>("SELECT * FROM Books ORDER BY Id DESC;");
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        using var conn = new SqliteConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<Book>(
            "SELECT * FROM Books WHERE Id = @Id;", new { Id = id });
    }

    public async Task<bool> ExistsByIsbnAsync(string isbn, int? excludeId = null)
    {
        using var conn = new SqliteConnection(_connectionString);
        var count = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Books WHERE ISBN = @Isbn AND (@ExcludeId IS NULL OR Id <> @ExcludeId);",
            new { Isbn = isbn, ExcludeId = excludeId });
        return count > 0;
    }

    public async Task<int> CreateAsync(Book book)
    {
        using var conn = new SqliteConnection(_connectionString);
        var id = await conn.ExecuteScalarAsync<int>(
            @"INSERT INTO Books (Title, Author, ISBN, Genre, PublicationYear, TotalCopies, AvailableCopies)
              VALUES (@Title, @Author, @ISBN, @Genre, @PublicationYear, @TotalCopies, @AvailableCopies);
              SELECT last_insert_rowid();", book);

        await _db.SaveAsync();
        return id;
    }

    public async Task<bool> UpdateAsync(Book book)
    {
        using var conn = new SqliteConnection(_connectionString);
        var updated = await conn.ExecuteAsync(
            @"UPDATE Books
              SET Title = @Title, Author = @Author, ISBN = @ISBN, Genre = @Genre,
                  PublicationYear = @PublicationYear, TotalCopies = @TotalCopies,
                  AvailableCopies = @AvailableCopies
              WHERE Id = @Id;", book) > 0;

        if (updated) await _db.SaveAsync();
        return updated;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = new SqliteConnection(_connectionString);
        var deleted = await conn.ExecuteAsync(
            "DELETE FROM Books WHERE Id = @Id;", new { Id = id }) > 0;

        if (deleted) await _db.SaveAsync();
        return deleted;
    }
}