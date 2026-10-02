using LibraryApi.Dtos;
using LibraryApi.Exceptions;
using LibraryApi.Models;
using LibraryApi.Repositories;

namespace LibraryApi.Services;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetAllAsync();
    Task<BookDto> GetByIdAsync(int id);
    Task<BookDto> CreateAsync(CreateBookDto dto);
    Task<BookDto> UpdateAsync(int id, UpdateBookDto dto);
    Task DeleteAsync(int id);
}

public class BookService : IBookService
{
    private readonly IBookRepository _books;

    public BookService(IBookRepository books)
    {
        _books = books;
    }

    public async Task<IEnumerable<BookDto>> GetAllAsync()
    {
        var books = await _books.GetAllAsync();
        return books.Select(ToDto);
    }

    public async Task<BookDto> GetByIdAsync(int id)
    {
        var book = await _books.GetByIdAsync(id)
            ?? throw new NotFoundException($"Book {id} not found");
        return ToDto(book);
    }

    public async Task<BookDto> CreateAsync(CreateBookDto dto)
    {
        var isbn = dto.ISBN.Trim();
        if (await _books.ExistsByIsbnAsync(isbn))
            throw new ConflictException("A book with this ISBN already exists");

        var book = new Book
        {
            Title = dto.Title.Trim(),
            Author = dto.Author.Trim(),
            ISBN = isbn,
            Genre = dto.Genre.Trim(),
            PublicationYear = dto.PublicationYear,
            TotalCopies = dto.TotalCopies,
            AvailableCopies = dto.TotalCopies // a new book starts with every copy available
        };
        book.Id = await _books.CreateAsync(book);

        return ToDto(book);
    }

    public async Task<BookDto> UpdateAsync(int id, UpdateBookDto dto)
    {
        var book = await _books.GetByIdAsync(id)
            ?? throw new NotFoundException($"Book {id} not found");

        // Business rule: you can't have more available copies than total copies
        if (dto.AvailableCopies > dto.TotalCopies)
            throw new BadRequestException("AvailableCopies cannot exceed TotalCopies");

        var isbn = dto.ISBN.Trim();
        if (await _books.ExistsByIsbnAsync(isbn, excludeId: id))
            throw new ConflictException("A book with this ISBN already exists");

        book.Title = dto.Title.Trim();
        book.Author = dto.Author.Trim();
        book.ISBN = isbn;
        book.Genre = dto.Genre.Trim();
        book.PublicationYear = dto.PublicationYear;
        book.TotalCopies = dto.TotalCopies;
        book.AvailableCopies = dto.AvailableCopies;

        await _books.UpdateAsync(book);
        return ToDto(book);
    }

    public async Task DeleteAsync(int id)
    {
        if (!await _books.DeleteAsync(id))
            throw new NotFoundException($"Book {id} not found");
    }

    private static BookDto ToDto(Book b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        Author = b.Author,
        ISBN = b.ISBN,
        Genre = b.Genre,
        PublicationYear = b.PublicationYear,
        TotalCopies = b.TotalCopies,
        AvailableCopies = b.AvailableCopies,
        IsAvailable = b.IsAvailable
    };
}