namespace BackendAutoSericeCar.Models
{
    public class Request
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
    }
}
