using Microsoft.EntityFrameworkCore;
using BackendAutoSericeCar.Models;

namespace BackendAutoSericeCar.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Настройка User
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Fio)
                    .HasColumnName("fio")
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Phone)
                    .HasColumnName("phone")
                    .HasMaxLength(20);

                entity.Property(e => e.Login)
                    .HasColumnName("login")
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Password)
                    .HasColumnName("password_hash")
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Type)
                    .HasColumnName("role_name")
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(e => e.Login).IsUnique();
            });

            // Настройка Request
            modelBuilder.Entity<Request>(entity =>
            {
                entity.ToTable("requests");
                entity.HasKey(e => e.RequestId);

                entity.Property(e => e.RequestId)
                    .HasColumnName("request_id")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.StartDate)
                    .HasColumnName("start_date")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.CarType)
                    .HasColumnName("car_type")
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.CarModel)
                    .HasColumnName("car_model")
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ProblemDescription)
                    .HasColumnName("problem_description")
                    .IsRequired();

                entity.Property(e => e.RequestStatus)
                    .HasColumnName("status_name")
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.CompletionDate)
                    .HasColumnName("actual_completion_date");

                entity.Property(e => e.PlannedCompletionDate)
                    .HasColumnName("planned_completion_date")
                    .IsRequired();

                entity.Property(e => e.RepairParts)
                    .HasColumnName("work_description");

                entity.Property(e => e.MasterId)
                    .HasColumnName("mechanic_id");

                entity.Property(e => e.ClientId)
                    .HasColumnName("client_id")
                    .IsRequired();

                entity.Property(e => e.IsDelayed)
                    .HasColumnName("is_delayed")
                    .HasDefaultValue(false);

                // Связи
                entity.HasOne(r => r.Master)
                    .WithMany(u => u.CreatedRequests)
                    .HasForeignKey(r => r.MasterId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(r => r.Client)
                    .WithMany()
                    .HasForeignKey(r => r.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(r => r.Comments)
                    .WithOne(c => c.Request)
                    .HasForeignKey(c => c.RequestId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Индексы
                entity.HasIndex(r => r.MasterId);
                entity.HasIndex(r => r.ClientId);
                entity.HasIndex(r => r.RequestStatus);
                entity.HasIndex(r => r.StartDate);
                entity.HasIndex(r => r.PlannedCompletionDate);
            });

            // Настройка Comment
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("comments");
                entity.HasKey(e => e.CommentId);

                entity.Property(e => e.CommentId)
                    .HasColumnName("comment_id")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Message)
                    .HasColumnName("message")
                    .IsRequired();

                entity.Property(e => e.MasterId)
                    .HasColumnName("master_id")
                    .IsRequired();

                entity.Property(e => e.RequestId)
                    .HasColumnName("request_id")
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Связи
                entity.HasOne(c => c.Master)
                    .WithMany(u => u.Comments)
                    .HasForeignKey(c => c.MasterId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Request)
                    .WithMany(r => r.Comments)
                    .HasForeignKey(c => c.RequestId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Индексы
                entity.HasIndex(c => c.MasterId);
                entity.HasIndex(c => c.RequestId);
            });
        }
    }
}