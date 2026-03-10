namespace BackendAutoSericeCar.Models.DTOs
{
    public class RequestDto
    {
        public int RequestId { get; set; }
        public DateTime StartDate { get; set; }
        public string CarType { get; set; }
        public string CarModel { get; set; }
        public string ProblemDescription { get; set; }
        public string RequestStatus { get; set; }
        public DateTime? CompletionDate { get; set; }
        public DateTime PlannedCompletionDate { get; set; }
        public string RepairParts { get; set; }
        public int? MasterId { get; set; }
        public int ClientId { get; set; }
        public bool IsDelayed { get; set; }

        // Простые объекты без циклических ссылок
        public UserDto Client { get; set; }
        public UserDto Master { get; set; }
        public List<CommentDto> Comments { get; set; }
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public string Fio { get; set; }
        public string Phone { get; set; }
        public string Type { get; set; }
        // Не включаем Login, Password и навигационные свойства
    }

    public class CommentDto
    {
        public int CommentId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public string MasterName { get; set; }
    }
}