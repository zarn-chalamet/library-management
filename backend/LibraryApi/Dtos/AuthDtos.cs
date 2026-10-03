using System.ComponentModel.DataAnnotations;

namespace LibraryApi.Dtos;

public class LoginDto
{
    [Required, EmailAddress]
	public string Email { get; set; } = string.Empty;
    [Required]
	public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required, MinLength(3)]
	public string Username { get; set; } = string.Empty;
    [Required, EmailAddress]
	public string Email { get; set; } = string.Empty;
    [Required]
	[RegularExpression(@"^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$",
		ErrorMessage = "Password must be at least 8 characters and include a number and a special character.")]
	public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
	public string Token { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
