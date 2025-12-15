const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify'); // Thêm thư viện này
const Blog = require('./models/blogModel'); 
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const blogsData = [
    {
        title: "10 Lợi ích tuyệt vời khi nuôi thú cưng bạn nên biết",
        image: "/uploads/blog_1.jpg",
        author: "Admin Fluffy",
        excerpt: "Nuôi thú cưng không chỉ là sở thích mà còn mang lại nhiều lợi ích sức khỏe tinh thần và thể chất đáng kinh ngạc.",
        content: `
            <p>Việc nuôi một chú chó hoặc mèo không chỉ mang lại niềm vui mà còn giúp cải thiện sức khỏe của bạn theo nhiều cách bất ngờ.</p>
            <h3>1. Giảm căng thẳng và lo âu</h3>
            <p>Chỉ cần vài phút vuốt ve thú cưng, cơ thể bạn sẽ giải phóng các hormone thư giãn như oxytocin, giúp giảm mức độ căng thẳng ngay lập tức.</p>
            <h3>2. Khuyến khích vận động</h3>
            <p>Những người nuôi chó thường có thói quen đi bộ hàng ngày, điều này giúp cải thiện sức khỏe tim mạch và duy trì vóc dáng cân đối.</p>
            <h3>3. Giảm cảm giác cô đơn</h3>
            <p>Thú cưng luôn là người bạn đồng hành trung thành, luôn lắng nghe và ở bên bạn những lúc khó khăn nhất.</p>
            <p>Hãy cân nhắc việc nhận nuôi một bé thú cưng ngay hôm nay để cuộc sống thêm phần ý nghĩa!</p>
        `,
        isVisible: true
    },
    {
        title: "Hướng dẫn chọn thức ăn hạt phù hợp nhất cho Chó Poodle",
        image: "/uploads/blog_2.jpg",
        author: "Bs. Thú Y Lan Anh",
        excerpt: "Poodle là giống chó kén ăn và có hệ tiêu hóa nhạy cảm. Tìm hiểu cách chọn loại hạt tốt nhất cho bé cưng của bạn.",
        content: `
            <p>Poodle nổi tiếng với bộ lông xoăn và tính cách thông minh, nhưng chúng cũng khá kén ăn. Dưới đây là bí quyết chọn thức ăn:</p>
            <h3>1. Chọn hạt có kích thước nhỏ</h3>
            <p>Hàm của Poodle khá nhỏ, đặc biệt là dòng Toy và Teacup. Hãy chọn loại hạt kích thước vừa phải để bé dễ nhai và tiêu hóa.</p>
            <h3>2. Thành phần dinh dưỡng</h3>
            <p>Ưu tiên các loại hạt chứa nhiều Protein từ thịt thật, Omega-3 và Omega-6 để giúp bộ lông xoăn của chúng luôn bóng mượt và không bị xơ rối.</p>
            <h3>3. Tránh các loại hạt chứa ngũ cốc độn</h3>
            <p>Ngũ cốc rẻ tiền như ngô, lúa mì có thể gây dị ứng cho Poodle. Hãy tìm các dòng "Grain-free" nếu có điều kiện.</p>
        `,
        isVisible: true
    },
    {
        title: "Bí quyết huấn luyện Mèo đi vệ sinh đúng chỗ trong 3 ngày",
        image: "/uploads/blog_3.jpg",
        author: "Admin Fluffy",
        excerpt: "Mèo đi vệ sinh lung tung là nỗi ám ảnh của nhiều 'con sen'. Đừng lo, chỉ cần 3 bước đơn giản này!",
        content: `
            <p>Mèo thực ra là loài vật rất sạch sẽ. Nếu chúng đi bậy, có thể do bạn chưa hướng dẫn đúng cách.</p>
            <h3>Bước 1: Chọn khay và cát phù hợp</h3>
            <p>Khay vệ sinh phải đủ rộng để mèo xoay người. Cát nên chọn loại vón cục tốt, khử mùi và ít bụi.</p>
            <h3>Bước 2: Đặt khay đúng vị trí</h3>
            <p>Đặt khay ở nơi yên tĩnh, ít người qua lại nhưng dễ tiếp cận. Tránh đặt cạnh bát ăn vì mèo không thích ăn gần nơi vệ sinh.</p>
            <h3>Bước 3: Khen thưởng</h3>
            <p>Khi thấy mèo có dấu hiệu muốn đi vệ sinh, hãy nhẹ nhàng bế chúng vào khay. Sau khi chúng đi xong, hãy vuốt ve hoặc thưởng snack nhẹ.</p>
        `,
        isVisible: true
    },
    {
        title: "Hamster bị tiêu chảy (Ướt đuôi): Nguyên nhân và cách chữa trị",
        image: "/uploads/blog_4.jpg",
        author: "Chuyên gia Hamster",
        excerpt: "Bệnh ướt đuôi (Wet Tail) là căn bệnh nguy hiểm hàng đầu ở Hamster. Phát hiện sớm có thể cứu sống bé.",
        content: `
            <p>Bệnh ướt đuôi thường do vi khuẩn gây ra khi Hamster bị stress hoặc môi trường sống không vệ sinh.</p>
            <h3>Dấu hiệu nhận biết</h3>
            <ul>
                <li>Phần lông quanh đuôi bị ướt, bẩn, có mùi hôi.</li>
                <li>Hamster lừ đừ, bỏ ăn, nằm cuộn tròn.</li>
                <li>Mắt trũng sâu do mất nước.</li>
            </ul>
            <h3>Cách xử lý</h3>
            <p>Ngay lập tức cách ly bé khỏi các con khác. Vệ sinh toàn bộ lồng nuôi bằng nước nóng. Đưa bé đến bác sĩ thú y để được kê kháng sinh và bù nước kịp thời. Tuyệt đối không tự ý cho uống thuốc của người.</p>
        `,
        isVisible: true
    },
    {
        title: "Chăm sóc thú cưng vào mùa đông: Những điều cần lưu ý",
        image: "/uploads/blog_5.jpg",
        author: "Admin Fluffy",
        excerpt: "Thời tiết lạnh giá có thể khiến chó mèo dễ bị ốm. Hãy trang bị kiến thức để giữ ấm cho boss.",
        content: `
            <p>Mùa đông miền Bắc rất khắc nghiệt, thú cưng cũng cần được giữ ấm giống như con người.</p>
            <h3>1. Mặc áo ấm</h3>
            <p>Với các giống chó lông ngắn hoặc nhỏ con như Chihuahua, Phốc, việc mặc áo là cần thiết khi ra ngoài trời.</p>
            <h3>2. Tăng khẩu phần ăn</h3>
            <p>Cơ thể vật nuôi cần nhiều năng lượng hơn để giữ ấm vào mùa đông. Hãy tăng nhẹ lượng thức ăn giàu protein và chất béo.</p>
            <h3>3. Hạn chế tắm</h3>
            <p>Chỉ tắm khi thực sự cần thiết và phải sấy khô ngay lập tức. Có thể dùng phấn tắm khô thay thế để tránh bé bị nhiễm lạnh.</p>
        `,
        isVisible: true
    },
    {
        title: "Triệt sản cho Chó Mèo: Nên hay Không?",
        image: "/uploads/blog_6.jpg",
        author: "Bs. Thú Y Nam",
        excerpt: "Triệt sản vẫn là chủ đề gây tranh cãi. Tuy nhiên, các bác sĩ thú y đều khuyên làm điều này vì lợi ích lâu dài.",
        content: `
            <p>Nhiều người nghĩ triệt sản là tàn nhẫn, nhưng thực tế đây là hành động nhân văn giúp kiểm soát số lượng thú hoang và bảo vệ sức khỏe vật nuôi.</p>
            <h3>Lợi ích sức khỏe</h3>
            <p>Triệt sản giúp giảm nguy cơ ung thư vú, ung thư tử cung ở con cái và ung thư tinh hoàn ở con đực. Nó cũng giúp thú cưng sống thọ hơn.</p>
            <h3>Cải thiện hành vi</h3>
            <p>Thú cưng đã triệt sản thường điềm tĩnh hơn, ít bỏ nhà đi tìm bạn tình và giảm hẳn thói quen đánh dấu lãnh thổ bằng nước tiểu trong nhà.</p>
        `,
        isVisible: true
    },
    {
        title: "5 Dấu hiệu cho thấy Cún cưng của bạn đang bị Stress",
        image: "/uploads/blog_7.jpg",
        author: "Admin Fluffy",
        excerpt: "Chó cũng có thể bị trầm cảm và căng thẳng. Hãy quan sát kỹ các biểu hiện sau để giúp đỡ chúng.",
        content: `
            <p>Đừng phớt lờ khi thấy cún cưng thay đổi tính nết. Đó có thể là lời kêu cứu thầm lặng.</p>
            <ul>
                <li><strong>Liếm chân liên tục:</strong> Đây là hành vi tự trấn an khi chúng lo lắng.</li>
                <li><strong>Phá phách đồ đạc:</strong> Khi bị bỏ ở nhà quá lâu, chúng cắn xé để giải tỏa năng lượng.</li>
                <li><strong>Rụng lông bất thường:</strong> Stress gây rối loạn hormone dẫn đến rụng lông từng mảng.</li>
                <li><strong>Bỏ ăn hoặc ăn quá nhiều:</strong> Thay đổi thói quen ăn uống đột ngột.</li>
            </ul>
            <p>Hãy dành nhiều thời gian chơi đùa và dắt chúng đi dạo để giải tỏa tâm lý nhé.</p>
        `,
        isVisible: true
    },
    {
        title: "Dinh dưỡng cho mèo con: Từ sơ sinh đến 1 tuổi",
        image: "/uploads/blog_8.jpg",
        author: "Chuyên gia Dinh dưỡng",
        excerpt: "Giai đoạn đầu đời quyết định sự phát triển của mèo. Cho ăn sai cách có thể gây còi cọc hoặc béo phì.",
        content: `
            <h3>Giai đoạn sơ sinh (0-4 tuần)</h3>
            <p>Sữa mẹ là tốt nhất. Nếu mất mẹ, phải dùng sữa công thức dành riêng cho mèo (KMR), tuyệt đối không cho uống sữa bò vì gây tiêu chảy.</p>
            <h3>Giai đoạn cai sữa (4-8 tuần)</h3>
            <p>Bắt đầu tập ăn dặm bằng pate loãng hoặc hạt ngâm mềm. Chia nhỏ thành 4-5 bữa/ngày.</p>
            <h3>Giai đoạn tăng trưởng (2-12 tháng)</h3>
            <p>Đây là lúc mèo phát triển khung xương và cơ bắp. Cần cung cấp thức ăn giàu Protein, Taurine và Canxi. Luôn đảm bảo đủ nước sạch.</p>
        `,
        isVisible: true
    },
    {
        title: "Cẩm nang du lịch cùng thú cưng an toàn và vui vẻ",
        image: "/uploads/blog_9.jpg",
        author: "Travel Blogger",
        excerpt: "Muốn đưa 'boss' đi khắp thế gian? Đừng quên chuẩn bị kỹ lưỡng những thứ này.",
        content: `
            <p>Đi du lịch cùng thú cưng là trải nghiệm tuyệt vời nhưng cũng đầy thách thức.</p>
            <h3>1. Chuẩn bị giấy tờ</h3>
            <p>Sổ tiêm chủng, giấy chứng nhận sức khỏe là bắt buộc nếu đi máy bay hoặc tàu hỏa.</p>
            <h3>2. Box vận chuyển</h3>
            <p>Hãy tập cho bé quen với lồng vận chuyển trước chuyến đi 1 tuần để bé không hoảng sợ.</p>
            <h3>3. Đồ dùng cá nhân</h3>
            <p>Mang theo bát ăn, thức ăn quen thuộc, tã lót và một món đồ chơi yêu thích để bé cảm thấy an tâm như ở nhà.</p>
        `,
        isVisible: true
    },
    {
        title: "Tại sao nên nuôi Rồng Nam Mỹ (Iguana)?",
        image: "/uploads/blog_10.jpg",
        author: "Hội Bò Sát",
        excerpt: "Rồng Nam Mỹ đang trở thành thú cưng 'độc lạ' được giới trẻ săn đón. Liệu chúng có khó nuôi không?",
        content: `
            <p>Khác với vẻ ngoài hầm hố, Rồng Nam Mỹ thực chất là loài ăn chay và khá hiền lành nếu được thuần hóa từ nhỏ.</p>
            <h3>Ưu điểm</h3>
            <ul>
                <li><strong>Ăn chay:</strong> Thức ăn chủ yếu là rau muống, bí đỏ, cà rốt... rất rẻ và dễ kiếm.</li>
                <li><strong>Tuổi thọ cao:</strong> Nếu chăm sóc tốt, chúng có thể sống tới 15-20 năm.</li>
                <li><strong>Độc đáo:</strong> Sở hữu một chú rồng nhỏ trong nhà chắc chắn sẽ khiến bạn bè trầm trồ.</li>
            </ul>
            <p>Tuy nhiên, bạn cần chuẩn bị đèn sưởi UV và chuồng nuôi đủ rộng vì chúng lớn rất nhanh.</p>
        `,
        isVisible: true
    }
];

const importBlogs = async () => {
    try {
        await Blog.deleteMany(); // Xóa blog cũ nếu muốn làm mới
        console.log('Đã xóa blog cũ...');

        // Tạo slug thủ công vì insertMany không kích hoạt middleware pre-save
        const blogsWithSlugs = blogsData.map((blog, index) => ({
            ...blog,
            slug: slugify(blog.title, { lower: true, locale: 'vi' }) + '-' + (Date.now() + index)
        }));

        await Blog.insertMany(blogsWithSlugs);
        console.log('✅ Đã thêm 10 bài blog mẫu thành công!');
        process.exit();
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

importBlogs();