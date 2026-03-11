using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAutoSericeCar.Models
{
    [Table("requests")]
    public class Request
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("car_type")]
        public string CarType { get; set; }

        [Column("car_model")]
        public string CarModel { get; set; }

        [Column("problem_description")]
        public string ProblemDescription { get; set; }

        [Column("status_name")]
        public string RequestStatus { get; set; }

        [Column("actual_completion_date")]
        public DateTime? CompletionDate { get; set; }

        [Column("planned_completion_date")]
        public DateTime PlannedCompletionDate { get; set; }

        [Column("work_description")]
        public string RepairParts { get; set; }

        [Column("mechanic_id")]
        public int? MasterId { get; set; }

        [Column("client_id")]
        public int ClientId { get; set; }

        [Column("is_delayed")]
        public bool IsDelayed { get; set; }

        // Навигационные свойства
        [ForeignKey("MasterId")]
        public User? Master { get; set; }

        [ForeignKey("ClientId")]
        public User? Client { get; set; }

        public ICollection<Comment>? Comments { get; set; }

        [Column("additional_mechanic_ids")]
        public string AdditionalMechanicIds { get; set; } = string.Empty;

        [Column("extension_requested")]
        public bool ExtensionRequested { get; set; } = false;

        [Column("extension_requested_days")]
        public int? ExtensionRequestedDays { get; set; }

        [Column("extension_status")]
        public string ExtensionStatus { get; set; } = "None";

        [Column("extension_comment")]
        public string ExtensionComment { get; set; } = string.Empty;
    }
}