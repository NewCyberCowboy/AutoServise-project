using BackendAutoSericeCar.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetRequestsCount()
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var total = Dt.Requests.Count;
            var inProgress = Dt.Requests.Count(r => r.RequestStatus == "В работе");
            var completed = Dt.Requests.Count(r => r.RequestStatus == "Завершена");

            return Ok(new { total, inProgress, completed });
        }

        [HttpGet("average")]
        public async Task<IActionResult> GetAverageCompletionTime()
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var completedRequests = Dt.Requests
                .Where(r => r.CompletionDate.HasValue)
                .ToList();

            if (!completedRequests.Any())
                return Ok(new { averageTime = 0 });

            var averageDays = completedRequests
                .Average(r => (r.CompletionDate.Value - r.StartDate).TotalDays);

            return Ok(new { averageTime = Math.Round(averageDays, 2) });
        }

        [HttpGet("delayed")]
        public async Task<IActionResult> GetDelayedRequests()
        {
            await Dt.LoadFromDatabaseAsync(_context);

            // Обновляем статус просрочки
            foreach (var request in Dt.Requests)
            {
                request.IsDelayed = request.PlannedCompletionDate < DateTime.UtcNow
                    && request.RequestStatus != "Завершена";
            }

            await Dt.SaveChangesAsync(_context);

            var delayed = Dt.Requests
                .Where(r => r.IsDelayed)
                .Select(r => new
                {
                    r.RequestId,
                    r.CarModel,
                    r.ProblemDescription,
                    r.PlannedCompletionDate,
                    DaysDelayed = (DateTime.UtcNow - r.PlannedCompletionDate).Days
                })
                .ToList();

            return Ok(delayed);
        }
    }
}