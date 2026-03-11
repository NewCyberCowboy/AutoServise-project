using Microsoft.EntityFrameworkCore;
using BackendAutoSericeCar.Data;

var builder = WebApplication.CreateBuilder(args);

// Настройка подключения к PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Инициализация базы данных
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Создание базы данных, если её нет
    await dbContext.Database.EnsureCreatedAsync();

    // Обновление схемы при работе без миграций (добавляем поля, если они отсутствуют)
    await dbContext.Database.ExecuteSqlRawAsync(@"
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS additional_mechanic_ids text NOT NULL DEFAULT '';
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS extension_requested boolean NOT NULL DEFAULT false;
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS extension_requested_days integer NULL;
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS extension_status text NOT NULL DEFAULT 'None';
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS extension_comment text NOT NULL DEFAULT '';
    ");

    // Инициализация тестовыми данными
    await Dt.InitializeAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();