using BackendAutoSericeCar.Data;
using BackendAutoSericeCar.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var user = Dt.Users
                .FirstOrDefault(u => u.Login == login.Login && u.Password == login.Password);

            if (user == null)
                return Unauthorized(new { message = "Неверный логин или пароль" });

            return Ok(new
            {
                user.UserId,
                user.Fio,
                user.Type,
                message = "Авторизация успешна"
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Login) || string.IsNullOrWhiteSpace(model.Password) || string.IsNullOrWhiteSpace(model.Fio))
                return BadRequest(new { message = "Заполните обязательные поля: fio, login, password" });

            await Dt.LoadFromDatabaseAsync(_context);

            if (Dt.Users.Any(u => u.Login == model.Login))
                return BadRequest(new { message = "Пользователь с таким логином уже существует" });

            var user = new User
            {
                Fio = model.Fio,
                Phone = model.Phone ?? string.Empty,
                Login = model.Login,
                Password = model.Password,
                Email = model.Email ?? string.Empty,
                Type = "Клиент",
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await Dt.LoadFromDatabaseAsync(_context);

            return Ok(new
            {
                user.UserId,
                user.Fio,
                user.Type,
                user.Login,
                user.Email,
                user.Phone,
                message = "Регистрация прошла успешно"
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var users = Dt.Users.Select(u => new
            {
                u.UserId,
                u.Fio,
                u.Login,
                Email = string.IsNullOrWhiteSpace(u.Email) ? null : u.Email,
                u.Phone,
                Type = u.Type,
                IsActive = u.IsActive
            });

            return Ok(users);
        }

        [HttpGet("roles")]
        public IActionResult GetRoles()
        {
            var roles = new[]
            {
                new { value = "Администратор", label = "Администратор" },
                new { value = "Менеджер", label = "Менеджер" },
                new { value = "Автомеханик", label = "Автомеханик" },
                new { value = "Клиент", label = "Клиент" }
            };
            return Ok(roles);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateModel model)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var user = Dt.Users.FirstOrDefault(u => u.UserId == id);
            if (user == null)
                return NotFound();

            user.Type = model.Role;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            await Dt.LoadFromDatabaseAsync(_context);

            return Ok(user);
        }

        [HttpPut("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var user = Dt.Users.FirstOrDefault(u => u.UserId == id);
            if (user == null)
                return NotFound();

            user.IsActive = !user.IsActive;
            // У пользователя IsActive не сохранится в БД, для прототипа обходим это полем модели
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            await Dt.LoadFromDatabaseAsync(_context);

            return Ok(new { user.UserId, user.IsActive });
        }
    }

    public class LoginModel
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }

    public class RoleUpdateModel
    {
        public string Role { get; set; }
    }

    public class RegisterModel
    {
        public string Fio { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
    }
}