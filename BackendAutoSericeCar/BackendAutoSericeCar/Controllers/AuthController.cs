using BackendAutoSericeCar.Data;
using Microsoft.AspNetCore.Mvc;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel login)
        {
            var user =  Dt.Users
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

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = Dt.Users.Select(u => new
            {
                u.UserId,
                u.Fio,
                u.Type
            });
            return Ok(users);
        }
    }

    public class LoginModel
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }
}