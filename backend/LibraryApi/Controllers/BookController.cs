using LibraryApi.Dtos;
using LibraryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryApi.Controllers;

[ApiController]
[Route("api/books")]
[Authorize] // every endpoint needs a valid token and role access
public class BookController : ControllerBase
{
    private readonly IBookService _books;

    public BookController(IBookService books)
    {
        _books = books;
    }

    // Get all books (all users can access)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _books.GetAllAsync());
    }

    // Get book by id (all users can access)
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        return Ok(await _books.GetByIdAsync(id));
    }

    // Creates a book (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
    {
        var book = await _books.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    // Update book by id (Admin only)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookDto dto)
    {
        return Ok(await _books.UpdateAsync(id, dto));
    }

    // Delete book by id (Admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _books.DeleteAsync(id);
        return NoContent();
    }
}