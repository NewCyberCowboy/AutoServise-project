using BackendAutoSericeCar.Data;
using BackendAutoSericeCar.Model;
using BackendAutoSericeCar.Models;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.Drawing.Imaging;
using ZXing;
using ZXing.Common;


namespace BackendAutoSericeCar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAllRequests()
        {
            return Ok(Dt.Requests);
        }

        [HttpGet("{id}")]
        public IActionResult GetRequestById(int id)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();
            return Ok(request);
        }

        [HttpPost]
        public IActionResult CreateRequest([FromBody] Request request)
        {
            request.RequestId = Dt.Requests.Count + 1;
            request.StartDate = DateTime.Now;
            request.RequestStatus = "Новая";
            Dt.Requests.Add(request);
            return CreatedAtAction(nameof(GetRequestById), new { id = request.RequestId }, request);
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] string status)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            request.RequestStatus = status;
            if (status == "Завершена")
                request.CompletionDate = DateTime.Now;

            return Ok(request);
        }

        [HttpPost("{id}/comment")]
        public IActionResult AddComment(int id, [FromBody] Comment comment)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            comment.CommentId = Dt.Comments.Count + 1;
            comment.RequestId = id;
            Dt.Comments.Add(comment);
            return Ok(comment);
        }

        [HttpGet("{id}/comments")]
        public IActionResult GetComments(int id)
        {
            var comments = Dt.Comments.Where(c => c.RequestId == id).ToList();
            return Ok(comments);
        }

        [HttpGet("{id}/qrcode")]
        public IActionResult GenerateQRCode(int id)
        {
            var request = Dt.Requests.FirstOrDefault(r => r.RequestId == id);
            if (request == null)
                return NotFound();

            string qrContent = $"Заявка #{request.RequestId}\nАвто: {request.CarModel}\nСтатус: {request.RequestStatus}";

            var writer = new BarcodeWriterPixelData
            {
                Format = BarcodeFormat.QR_CODE,
                Options = new EncodingOptions
                {
                    Height = 250,
                    Width = 250,
                    Margin = 1
                }
            };

            var pixelData = writer.Write(qrContent);
            using (var bitmap = new Bitmap(pixelData.Width, pixelData.Height, PixelFormat.Format32bppRgb))
            {
                using (var ms = new MemoryStream())
                {
                    var bitmapData = bitmap.LockBits(new Rectangle(0, 0, bitmap.Width, bitmap.Height),
                        ImageLockMode.WriteOnly, PixelFormat.Format32bppRgb);
                    try
                    {
                        System.Runtime.InteropServices.Marshal.Copy(pixelData.Pixels, 0,
                            bitmapData.Scan0, pixelData.Pixels.Length);
                    }
                    finally
                    {
                        bitmap.UnlockBits(bitmapData);
                    }

                    bitmap.Save(ms, ImageFormat.Png);
                    return File(ms.ToArray(), "image/png");
                }
            }
        }
    }
}