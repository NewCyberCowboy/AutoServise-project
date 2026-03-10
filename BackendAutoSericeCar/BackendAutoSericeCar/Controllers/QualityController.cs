using BackendAutoSericeCar.Data;
using BackendAutoSericeCar.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QualityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QualityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPut("extend/{id}")]
        public async Task<IActionResult> ExtendDeadline(int id, [FromBody] int days)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.PlannedCompletionDate = request.PlannedCompletionDate.AddDays(days);
            request.IsDelayed = false;

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new
            {
                request.RequestId,
                request.PlannedCompletionDate,
                message = $"Срок выполнения продлен на {days} дней"
            });
        }

        [HttpPut("assign/{id}")]
        public async Task<IActionResult> AssignMaster(int id, [FromBody] int masterId)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            var master = Dt.Users.FirstOrDefault(u => u.UserId == masterId && u.Type == "Автомеханик");
            if (master == null)
                return BadRequest(new { message = "Указанный пользователь не является автомехаником" });

            request.MasterId = masterId;
            request.RequestStatus = "В работе";

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new
            {
                request.RequestId,
                request.MasterId,
                master.Fio,
                message = "Механик назначен на заявку"
            });
        }

        [HttpGet("masters")]
        public async Task<IActionResult> GetMasters()
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var masters = Dt.Users
                .Where(u => u.Type == "Автомеханик")
                .Select(u => new
                {
                    u.UserId,
                    u.Fio,
                    ActiveRequests = Dt.Requests.Count(r => r.MasterId == u.UserId && r.RequestStatus != "Завершена")
                });

            return Ok(masters);
        }

        [HttpPut("unassign/{id}")]
        public async Task<IActionResult> UnassignMaster(int id)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.MasterId = null;
            request.RequestStatus = "Новая";

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new
            {
                request.RequestId,
                request.MasterId,
                message = "Механик отстранён от заявки"
            });
        }

        [HttpPut("deadline/{id}")]
        public async Task<IActionResult> SetDeadline(int id, [FromBody] DateTime newDeadline)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            if (newDeadline < DateTime.UtcNow.Date)
                return BadRequest(new { message = "Новая дата должна быть не ранее сегодняшней" });

            request.PlannedCompletionDate = newDeadline;
            request.IsDelayed = newDeadline < DateTime.UtcNow;

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new
            {
                request.RequestId,
                request.PlannedCompletionDate,
                message = "Плановая дата обновлена"
            });
        }
    }
}