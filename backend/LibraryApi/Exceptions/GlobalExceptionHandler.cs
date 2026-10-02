using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.Sqlite;

namespace LibraryApi.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception ex, CancellationToken ct)
    {
        var (status, message) = ex switch
        {
            ConflictException => (StatusCodes.Status409Conflict, ex.Message),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, ex.Message),
            NotFoundException => (StatusCodes.Status404NotFound, ex.Message),
            BadRequestException => (StatusCodes.Status400BadRequest, ex.Message),
            // Safety net: UNIQUE constraint hit (e.g. two requests racing)
            SqliteException { SqliteErrorCode: 19 } => (StatusCodes.Status409Conflict, "Duplicate value"),
            _ => (StatusCodes.Status500InternalServerError, "Something went wrong")
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(ex, "Unhandled exception");

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new { message }, ct);
        return true;
    }
}