using System.ComponentModel.DataAnnotations;

namespace LibraryApi.Dtos;

public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public int PublicationYear { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public bool IsAvailable { get; set; }
}

public class CreateBookDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Author { get; set; } = string.Empty;
    [Required] public string ISBN { get; set; } = string.Empty;
    [Required] public string Genre { get; set; } = string.Empty;
    [Range(1000, 2100)] public int PublicationYear { get; set; }
    [Range(0, 10000)] public int TotalCopies { get; set; }
}

public class UpdateBookDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Author { get; set; } = string.Empty;
    [Required] public string ISBN { get; set; } = string.Empty;
    [Required] public string Genre { get; set; } = string.Empty;
    [Range(1000, 2100)] public int PublicationYear { get; set; }
    [Range(0, 10000)] public int TotalCopies { get; set; }
    [Range(0, 10000)] public int AvailableCopies { get; set; }
}