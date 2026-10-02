using LibraryApi.Dtos;
using LibraryApi.Models;
using LibraryApi.Repositories;

namespace LibraryApi.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly JwtService _jwt;

    public AuthService(IUserRepository users, JwtService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    /// Returns null when email or password is wrong.
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(NormalizeEmail(dto.Email));
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return ToResponse(user);
    }

    /// Returns null when the email is already registered.
    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        var email = NormalizeEmail(dto.Email);
        if (await _users.GetByEmailAsync(email) != null)
            return null;

        var user = new User
        {
            Username = dto.Username.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User", // regular user role(can't register admin)
            CreatedAt = DateTime.UtcNow
        };
        user.Id = await _users.CreateUserAsync(user);

        return ToResponse(user);
    }

    // helpers for email check
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private AuthResponseDto ToResponse(User user) => new()
    {
        Token = _jwt.GenerateToken(user),
        Username = user.Username,
        Email = user.Email,
        Role = user.Role
    };
}