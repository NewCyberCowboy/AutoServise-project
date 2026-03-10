using BackendAutoSericeCar.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAutoSericeCar.Data
{
    public static class Dt 
    {
        public static List<Request> Requests { get; set; } = new List<Request>();
        public static List<User> Users { get; set; } = new List<User>();
        public static List<Comment> Comments { get; set; } = new List<Comment>();

        // Убираем статическое поле DbContext - это причина ошибки!
        // public static AppDbContext? DbContext { get; set; }

        // Вместо этого передаем контекст как параметр
        public static async Task LoadFromDatabaseAsync(AppDbContext context)
        {
            Requests = await context.Requests
                .Include(r => r.Client)
                .Include(r => r.Master)
                .Include(r => r.Comments)
                .ToListAsync();

            Users = await context.Users.ToListAsync();
            Comments = await context.Comments
                .Include(c => c.Master)
                .Include(c => c.Request)
                .ToListAsync();
        }

        // Сохраняем изменения в БД
        public static async Task SaveChangesAsync(AppDbContext context)
        {
            await context.SaveChangesAsync();
            await LoadFromDatabaseAsync(context);
        }

        // Добавляем заявку
        public static async Task AddRequestAsync(AppDbContext context, Request request)
        {
            await context.Requests.AddAsync(request);
            await context.SaveChangesAsync();
            await LoadFromDatabaseAsync(context);
        }

        // Обновляем заявку
        public static async Task UpdateRequestAsync(AppDbContext context, Request request)
        {
            context.Requests.Update(request);
            await context.SaveChangesAsync();
            await LoadFromDatabaseAsync(context);
        }

        // Добавляем комментарий
        public static async Task AddCommentAsync(AppDbContext context, Comment comment)
        {
            await context.Comments.AddAsync(comment);
            await context.SaveChangesAsync();
            await LoadFromDatabaseAsync(context);
        }

        // Инициализация тестовыми данными
        public static async Task InitializeAsync(AppDbContext context)
        {
            // Устанавливаем часовой пояс
            await context.Database.ExecuteSqlRawAsync("SET TIME ZONE 'UTC';");

            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new User { Fio = "Иванов Иван Иванович", Phone = "+7(999)123-45-67", Login = "admin", Password = "admin", Type = "Администратор" },
                    new User { Fio = "Петров Петр Петрович", Phone = "+7(999)234-56-78", Login = "master", Password = "master", Type = "Автомеханик" },
                    new User { Fio = "Сидоров Сидор Сидорович", Phone = "+7(999)345-67-89", Login = "client", Password = "client", Type = "Клиент" }
                };

                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }

            if (!await context.Requests.AnyAsync())
            {
                var client = await context.Users.FirstAsync(u => u.Type == "Клиент");
                var master = await context.Users.FirstAsync(u => u.Type == "Автомеханик");

                var now = DateTime.UtcNow;

                var requests = new List<Request>
                {
                    new Request
                    {
                        StartDate = now.AddDays(-5),
                        CarType = "Легковая",
                        CarModel = "Toyota Camry",
                        ProblemDescription = "Не заводится двигатель",
                        RequestStatus = "В работе",
                        PlannedCompletionDate = now.AddDays(2),
                        RepairParts = "Стартер, аккумулятор",
                        MasterId = master.UserId,
                        ClientId = client.UserId,
                        IsDelayed = false
                    },
                    new Request
                    {
                        StartDate = now.AddDays(-10),
                        CarType = "Грузовая",
                        CarModel = "Volvo FH",
                        ProblemDescription = "Стук в двигателе",
                        RequestStatus = "Готова к выдаче",
                        CompletionDate = now.AddDays(-1),
                        PlannedCompletionDate = now.AddDays(-2),
                        RepairParts = "Поршневая группа",
                        MasterId = master.UserId,
                        ClientId = client.UserId,
                        IsDelayed = true
                    }
                };

                await context.Requests.AddRangeAsync(requests);
                await context.SaveChangesAsync();
            }

            if (!await context.Comments.AnyAsync())
            {
                var master = await context.Users.FirstAsync(u => u.Type == "Автомеханик");
                var request = await context.Requests.FirstAsync();
                var now = DateTime.UtcNow;

                var comments = new List<Comment>
                {
                    new Comment { Message = "Требуется диагностика", MasterId = master.UserId, RequestId = request.RequestId, CreatedAt = now.AddDays(-4) },
                    new Comment { Message = "Запчасти заказаны", MasterId = master.UserId, RequestId = request.RequestId, CreatedAt = now.AddDays(-3) }
                };

                await context.Comments.AddRangeAsync(comments);
                await context.SaveChangesAsync();
            }

            // Загружаем данные в статические списки
            await LoadFromDatabaseAsync(context);
        }
    }
}