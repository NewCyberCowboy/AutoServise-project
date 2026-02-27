namespace BackendAutoSericeCar.Models
{
    public class Comment
    {
        public int CommentId { get; set; }
        public string Message { get; set; }
        public int MasterId { get; set; }
        public int RequestId { get; set; }
    }
}
