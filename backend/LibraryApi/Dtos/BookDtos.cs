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
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(150)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(\d{9}[\dXx]|\d{13})$",
        ErrorMessage = "ISBN must be 10 or 13 characters (digits only; an ISBN-10 may end in X).")]
    public string ISBN { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Genre { get; set; } = string.Empty;

    [Range(1000, 2100)]
    public int PublicationYear { get; set; }

    [Range(0, 10000)]
    public int TotalCopies { get; set; }
}

public class UpdateBookDto
{
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(150)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(\d{9}[\dXx]|\d{13})$",
        ErrorMessage = "ISBN must be 10 or 13 characters (digits only; an ISBN-10 may end in X).")]
    public string ISBN { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Genre { get; set; } = string.Empty;

    [Range(1000, 2100)]
    public int PublicationYear { get; set; }

    [Range(0, 10000)]
    public int TotalCopies { get; set; }

    [Range(0, 10000)]
    public int AvailableCopies { get; set; }
}