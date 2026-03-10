using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAutoSericeCar.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("fio")]
        public string Fio { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("login")]
        public string Login { get; set; }

        [Column("password_hash")]
        public string Password { get; set; }

        [Column("role_name")]
        public string Type { get; set; }

        // Дополнительные поля, используемые в UI (не маппятся в БД)
        [NotMapped]
        public bool IsActive { get; set; } = true;

        [NotMapped]
        public string Email { get; set; } = string.Empty;

        // Навигационные свойства
        public ICollection<Request>? CreatedRequests { get; set; }
        public ICollection<Comment>? Comments { get; set; }
    }
}