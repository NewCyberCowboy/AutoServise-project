using BackendAutoSericeCar.Model;
using BackendAutoSericeCar.Models;

namespace BackendAutoSericeCar.Data
{
    public class Dt
    {
        public static List<Request> Requests = new List<Request>();
        public static List<User> Users = new List<User>();
        public static List<Comment> Comments = new List<Comment>();

        // Инициализация тестовыми данными
        static Dt()
        {
            // Добавляем пользователей
            Users.AddRange(new[]
            {
                new User { UserId = 1, Fio = "Иванов Иван Иванович", Phone = "+7(999)123-45-67", Login = "admin", Password = "admin", Type = "Администратор" },
                new User { UserId = 2, Fio = "Петров Петр Петрович", Phone = "+7(999)234-56-78", Login = "master", Password = "master", Type = "Автомеханик" },
                new User { UserId = 3, Fio = "Сидоров Сидор Сидорович", Phone = "+7(999)345-67-89", Login = "client", Password = "client", Type = "Клиент" }
            });

            // Добавляем заявки
            Requests.AddRange(new[]
            {
                new Request
                {
                    RequestId = 1,
                    StartDate = DateTime.Now.AddDays(-5),
                    CarType = "Легковая",
                    CarModel = "Toyota Camry",
                    ProblemDescription = "Не заводится двигатель",
                    RequestStatus = "В работе",
                    PlannedCompletionDate = DateTime.Now.AddDays(2),
                    RepairParts = "Стартер, аккумулятор",
                    MasterId = 2,
                    ClientId = 3,
                    IsDelayed = false
                },
                new Request
                {
                    RequestId = 2,
                    StartDate = DateTime.Now.AddDays(-10),
                    CarType = "Грузовая",
                    CarModel = "Volvo FH",
                    ProblemDescription = "Стук в двигателе",
                    RequestStatus = "Готова к выдаче",
                    CompletionDate = DateTime.Now.AddDays(-1),
                    PlannedCompletionDate = DateTime.Now.AddDays(-2),
                    RepairParts = "Поршневая группа",
                    MasterId = 2,
                    ClientId = 3,
                    IsDelayed = true
                }
            });

            // Добавляем комментарии
            Comments.AddRange(new[]
            {
                new Comment { CommentId = 1, Message = "Требуется диагностика", MasterId = 2, RequestId = 1 },
                new Comment { CommentId = 2, Message = "Запчасти заказаны", MasterId = 2, RequestId = 1 }
            });
        }
    }
}
