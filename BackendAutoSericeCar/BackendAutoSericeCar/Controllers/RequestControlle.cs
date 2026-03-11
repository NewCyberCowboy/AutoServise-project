using BackendAutoSericeCar.Data;
using BackendAutoSericeCar.Models;
using BackendAutoSericeCar.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RequestController> _logger;

        public RequestController(AppDbContext context, ILogger<RequestController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRequests()
        {
            try
            {
                _logger.LogInformation("Начало загрузки всех заявок");

                // Загружаем данные напрямую из БД и проецируем в DTO
                var requests = await _context.Requests
                    .Include(r => r.Client)
                    .Include(r => r.Master)
                    .Include(r => r.Comments)
                    .Select(r => new RequestDto
                    {
                        RequestId = r.RequestId,
                        StartDate = r.StartDate,
                        CarType = r.CarType,
                        CarModel = r.CarModel,
                        ProblemDescription = r.ProblemDescription,
                        RequestStatus = r.RequestStatus,
                        CompletionDate = r.CompletionDate,
                        PlannedCompletionDate = r.PlannedCompletionDate,
                        RepairParts = r.RepairParts,
                        MasterId = r.MasterId,
                        ClientId = r.ClientId,
                        IsDelayed = r.IsDelayed,
                        AdditionalMechanicIds = r.AdditionalMechanicIds,
                        ExtensionRequested = r.ExtensionRequested,
                        ExtensionRequestedDays = r.ExtensionRequestedDays,
                        ExtensionStatus = r.ExtensionStatus,
                        ExtensionComment = r.ExtensionComment,
                        Client = r.Client != null ? new UserDto
                        {
                            UserId = r.Client.UserId,
                            Fio = r.Client.Fio,
                            Phone = r.Client.Phone,
                            Type = r.Client.Type
                        } : null,
                        Master = r.Master != null ? new UserDto
                        {
                            UserId = r.Master.UserId,
                            Fio = r.Master.Fio,
                            Phone = r.Master.Phone,
                            Type = r.Master.Type
                        } : null,
                        Comments = r.Comments.Select(c => new CommentDto
                        {
                            CommentId = c.CommentId,
                            Message = c.Message,
                            CreatedAt = c.CreatedAt,
                            MasterName = c.Master != null ? c.Master.Fio : null
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation($"Загружено {requests.Count} заявок");

                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при загрузке заявок");
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestById(int id)
        {
            try
            {
                _logger.LogInformation($"Загрузка заявки с ID: {id}");

                var request = await _context.Requests
                    .Include(r => r.Client)
                    .Include(r => r.Master)
                    .Include(r => r.Comments)
                    .Where(r => r.RequestId == id)
                    .Select(r => new RequestDto
                    {
                        RequestId = r.RequestId,
                        StartDate = r.StartDate,
                        CarType = r.CarType,
                        CarModel = r.CarModel,
                        ProblemDescription = r.ProblemDescription,
                        RequestStatus = r.RequestStatus,
                        CompletionDate = r.CompletionDate,
                        PlannedCompletionDate = r.PlannedCompletionDate,
                        RepairParts = r.RepairParts,
                        MasterId = r.MasterId,
                        ClientId = r.ClientId,
                        IsDelayed = r.IsDelayed,
                        AdditionalMechanicIds = r.AdditionalMechanicIds,
                        ExtensionRequested = r.ExtensionRequested,
                        ExtensionRequestedDays = r.ExtensionRequestedDays,
                        ExtensionStatus = r.ExtensionStatus,
                        ExtensionComment = r.ExtensionComment,
                        Client = r.Client != null ? new UserDto
                        {
                            UserId = r.Client.UserId,
                            Fio = r.Client.Fio,
                            Phone = r.Client.Phone,
                            Type = r.Client.Type
                        } : null,
                        Master = r.Master != null ? new UserDto
                        {
                            UserId = r.Master.UserId,
                            Fio = r.Master.Fio,
                            Phone = r.Master.Phone,
                            Type = r.Master.Type
                        } : null,
                        Comments = r.Comments.Select(c => new CommentDto
                        {
                            CommentId = c.CommentId,
                            Message = c.Message,
                            CreatedAt = c.CreatedAt,
                            MasterName = c.Master != null ? c.Master.Fio : null
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (request == null)
                {
                    _logger.LogWarning($"Заявка с ID {id} не найдена");
                    return NotFound();
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при загрузке заявки {id}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] Request request)
        {
            try
            {
                _logger.LogInformation("Создание новой заявки");

                if (request == null)
                {
                    return BadRequest(new { message = "Данные заявки не могут быть пустыми" });
                }

                request.RequestId = 0;
                request.StartDate = DateTime.UtcNow;
                request.RequestStatus = "Новая";
                request.IsDelayed = false;

                if (request.PlannedCompletionDate.Kind == DateTimeKind.Local)
                {
                    request.PlannedCompletionDate = request.PlannedCompletionDate.ToUniversalTime();
                }

                _context.Requests.Add(request);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Заявка создана с ID: {request.RequestId}");

                // Возвращаем созданную заявку с ID
                return CreatedAtAction(nameof(GetRequestById), new { id = request.RequestId }, request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании заявки");
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.RequestStatus = status;
            if (status == "Завершена")
                request.CompletionDate = DateTime.UtcNow;

            await Dt.UpdateRequestAsync(_context, request);

            // Возвращаем объект DTO, чтобы избежать циклических ссылок в JSON
            var updatedRequestDto = new RequestDto
            {
                RequestId = request.RequestId,
                StartDate = request.StartDate,
                CarType = request.CarType,
                CarModel = request.CarModel,
                ProblemDescription = request.ProblemDescription,
                RequestStatus = request.RequestStatus,
                CompletionDate = request.CompletionDate,
                PlannedCompletionDate = request.PlannedCompletionDate,
                RepairParts = request.RepairParts,
                MasterId = request.MasterId,
                ClientId = request.ClientId,
                IsDelayed = request.IsDelayed,
                AdditionalMechanicIds = request.AdditionalMechanicIds,
                ExtensionRequested = request.ExtensionRequested,
                ExtensionRequestedDays = request.ExtensionRequestedDays,
                ExtensionStatus = request.ExtensionStatus,
                ExtensionComment = request.ExtensionComment,
                Client = request.Client != null ? new UserDto
                {
                    UserId = request.Client.UserId,
                    Fio = request.Client.Fio,
                    Phone = request.Client.Phone,
                    Type = request.Client.Type
                } : null,
                Master = request.Master != null ? new UserDto
                {
                    UserId = request.Master.UserId,
                    Fio = request.Master.Fio,
                    Phone = request.Master.Phone,
                    Type = request.Master.Type
                } : null,
                Comments = request.Comments?.Select(c => new CommentDto
                {
                    CommentId = c.CommentId,
                    Message = c.Message,
                    CreatedAt = c.CreatedAt,
                    MasterName = c.Master?.Fio
                }).ToList() ?? new List<CommentDto>()
            };

            return Ok(updatedRequestDto);
        }

        [HttpPost("{id}/additional-mechanic")]
        public async Task<IActionResult> AddAdditionalMechanic(int id, [FromBody] int mechanicId)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            var mechanic = Dt.Users.FirstOrDefault(u => u.UserId == mechanicId && u.Type == "Автомеханик");
            if (mechanic == null)
                return BadRequest(new { message = "Указанный механик не найден" });

            var list = string.IsNullOrWhiteSpace(request.AdditionalMechanicIds)
                ? new List<int>()
                : request.AdditionalMechanicIds.Split(',').Select(x => int.TryParse(x, out var v) ? v : 0).Where(v => v > 0).ToList();

            if (!list.Contains(mechanicId))
                list.Add(mechanicId);

            request.AdditionalMechanicIds = string.Join(',', list);

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new { request.RequestId, request.AdditionalMechanicIds });
        }

        [HttpPost("{id}/extension-request")]
        public async Task<IActionResult> RequestExtension(int id, [FromBody] int days)
        {
            if (days <= 0)
                return BadRequest(new { message = "Количество дней должно быть больше 0" });

            await Dt.LoadFromDatabaseAsync(_context);
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.ExtensionRequested = true;
            request.ExtensionRequestedDays = days;
            request.ExtensionStatus = "Pending";
            request.ExtensionComment = "Запрос на продление отправлен";

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new { request.RequestId, request.ExtensionStatus, request.ExtensionRequestedDays });
        }

        [HttpPut("{id}/extension-approve")]
        public async Task<IActionResult> ApproveExtension(int id)
        {
            await Dt.LoadFromDatabaseAsync(_context);
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            if (!request.ExtensionRequested || request.ExtensionStatus != "Pending")
                return BadRequest(new { message = "Нет запроса на продление" });

            request.PlannedCompletionDate = request.PlannedCompletionDate.AddDays(request.ExtensionRequestedDays ?? 0);
            request.ExtensionStatus = "Approved";
            request.ExtensionComment = "Продление согласовано";
            request.ExtensionRequested = false;
            request.ExtensionRequestedDays = null;

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new { request.RequestId, request.PlannedCompletionDate, request.ExtensionStatus });
        }

        [HttpPut("{id}/extension-decline")]
        public async Task<IActionResult> DeclineExtension(int id)
        {
            await Dt.LoadFromDatabaseAsync(_context);
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            if (!request.ExtensionRequested || request.ExtensionStatus != "Pending")
                return BadRequest(new { message = "Нет запроса на продление" });

            request.ExtensionStatus = "Declined";
            request.ExtensionComment = "Продление отклонено";
            request.ExtensionRequested = false;
            request.ExtensionRequestedDays = null;

            await Dt.UpdateRequestAsync(_context, request);

            return Ok(new { request.RequestId, request.ExtensionStatus });
        }

        [HttpPost("{id}/comment")]
        public async Task<IActionResult> AddComment(int id, [FromBody] Comment comment)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            comment.CommentId = Dt.Comments.Count + 1;
            comment.RequestId = id;
            comment.CreatedAt = DateTime.UtcNow;

            await Dt.AddCommentAsync(_context, comment);

            return Ok(comment);
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            await Dt.LoadFromDatabaseAsync(_context);

            var comments = Dt.Comments.Where(c => c.RequestId == id).ToList();
            return Ok(comments);
        }

        [HttpGet("{id}/qrcode")]
        public IActionResult GenerateQRCode(int id)
        {
            try
            {
                _logger.LogInformation($"Генерация QR-кода для заявки {id}");

                var request = _context.Requests
                    .Include(r => r.Client)
                    .Include(r => r.Master)
                    .FirstOrDefault(r => r.RequestId == id);

                if (request == null)
                {
                    _logger.LogWarning($"Заявка с ID {id} не найдена");
                    return NotFound();
                }

                // Если заявка завершена, QR-код направляет на форму обратной связи
                const string feedbackFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdhZcExx6LSIXxk0ub55mSu-WIh23WYdGG9HY5EZhLDo7P8eA/viewform";

                string qrContent;
                if (request.RequestStatus == "Завершена")
                {
                    qrContent = feedbackFormUrl;
                }
                else
                {
                    qrContent = $@"
                        Заявка #{request.RequestId}
                        Автомобиль: {request.CarModel} ({request.CarType})
                        Статус: {request.RequestStatus}
                        Клиент: {request.Client?.Fio ?? "Не указан"}
                        Механик: {request.Master?.Fio ?? "Не назначен"}
                        Дата создания: {request.StartDate:dd.MM.yyyy}
                        Плановая дата: {request.PlannedCompletionDate:dd.MM.yyyy}
                        Описание: {request.ProblemDescription}";
                }

                // Создаем QR-код
                using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                {
                    QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);

                    using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                    {
                        byte[] qrCodeImage = qrCode.GetGraphic(20);

                        _logger.LogInformation($"QR-код для заявки {id} успешно сгенерирован");

                        // Возвращаем изображение
                        return File(qrCodeImage, "image/png", $"request_{id}_qrcode.png");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при генерации QR-кода для заявки {id}");
                return StatusCode(500, new { error = "Ошибка при генерации QR-кода" });
            }
        }
    }
}