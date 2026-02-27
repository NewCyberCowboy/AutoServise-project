using BackendAutoSericeCar.Data;
using Microsoft.AspNetCore.Mvc;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QualityController : ControllerBase
    {
        [HttpPut("extend/{id}")]
        public IActionResult ExtendDeadline(int id, [FromBody] int days)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.PlannedCompletionDate = request.PlannedCompletionDate.AddDays(days);
            request.IsDelayed = false;

            return Ok(new
            {
                request.RequestId,
                request.PlannedCompletionDate,
                message = $"Срок выполнения продлен на {days} дней"
            });
        }

        [HttpPut("assign/{id}")]
        public IActionResult AssignMaster(int id, [FromBody] int masterId)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            var master = Dt.Users.FirstOrDefault(u => u.UserId == masterId && u.Type == "Автомеханик");
            if (master == null)
                return BadRequest(new { message = "Указанный пользователь не является автомехаником" });

            request.MasterId = masterId;
            request.RequestStatus = "В работе";

            return Ok(new
            {
                request.RequestId,
                request.MasterId,
                master.Fio,
                message = "Механик назначен на заявку"
            });
        }

        [HttpGet("masters")]
        public IActionResult GetMasters()
        {
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
    }
}