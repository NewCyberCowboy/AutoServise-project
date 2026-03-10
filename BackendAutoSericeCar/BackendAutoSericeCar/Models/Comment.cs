using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAutoSericeCar.Models
{
    [Table("comments")]
    public class Comment
    {
        [Key]
        [Column("comment_id")]
        public int CommentId { get; set; }

        [Column("message")]
        public string Message { get; set; }

        [Column("master_id")]
        public int MasterId { get; set; }

        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Навигационные свойства
        [ForeignKey("MasterId")]
        public User? Master { get; set; }

        [ForeignKey("RequestId")]
        public Request? Request { get; set; }
    }
}