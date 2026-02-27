using BackendAutoSericeCar.Data;
using Microsoft.AspNetCore.Mvc;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        [HttpGet("count")]
        public IActionResult GetRequestsCount()
        {
            var total = Dt.Requests.Count;
            var inProgress = Dt.Requests.Count(r => r.RequestStatus == "В работе");
            var completed = Dt.Requests.Count(r => r.RequestStatus == "Завершена");

            return Ok(new { total, inProgress, completed });
        }

        [HttpGet("average")]
        public IActionResult GetAverageCompletionTime()
        {
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
        public IActionResult GetDelayedRequests()
        {
            // Обновляем статус просрочки
            foreach (var request in Dt.Requests)
            {
                request.IsDelayed = request.PlannedCompletionDate < DateTime.Now
                    && request.RequestStatus != "Завершена";
            }

            var delayed = Dt.Requests
                .Where(r => r.IsDelayed)
                .Select(r => new
                {
                    r.RequestId,
                    r.CarModel,
                    r.ProblemDescription,
                    r.PlannedCompletionDate,
                    DaysDelayed = (DateTime.Now - r.PlannedCompletionDate).Days
                })
                .ToList();

            return Ok(delayed);
        }
    }
}