
# Aquascape FE

Dự án Frontend cho ứng dụng Aquascape, được xây dựng bằng React, Vite và TypeScript.

## Bắt đầu

Hướng dẫn này sẽ giúp bạn cài đặt và chạy dự án trên máy tính của mình để phát triển và thử nghiệm.

### Điều kiện cần có

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:
- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- [Yarn](https://yarnpkg.com/) (được khuyến khích sử dụng vì dự án có file `yarn.lock`)

### Hướng dẫn cài đặt và chạy dự án

Thực hiện theo các bước sau để cài đặt và chạy dự án lokal:

**1. Clone Repository**

Clone mã nguồn của dự án về máy tính của bạn:
```bash
git clone <URL_CUA_REPOSITORY>
cd aquascape_fe
```
*Thay thế `<URL_CUA_REPOSITORY>` bằng URL thực tế của Git repository.*

**2. Cài đặt các gói phụ thuộc**

Sử dụng `yarn` để cài đặt tất cả các thư viện cần thiết đã được định nghĩa trong `package.json`:
```bash
yarn install
```

**3. Cấu hình môi trường**

Dự án sử dụng file `.env` để quản lý các biến môi trường. Sao chép file `.env.example` để tạo file `.env` của riêng bạn:
```bash
cp .env.example .env
```
Sau đó, mở file `.env` và chỉnh sửa các giá trị cho phù hợp với môi trường phát triển của bạn (ví dụ: URL của API backend).

**4. Chạy dự án ở chế độ phát triển**

Sau khi cài đặt xong, khởi động server phát triển bằng lệnh sau:
```bash
yarn dev
```
Lệnh này sẽ khởi chạy ứng dụng trên một cổng lokal (thường là `http://localhost:5173`). Mở trình duyệt và truy cập địa chỉ này để xem ứng dụng.

Server sẽ tự động tải lại mỗi khi bạn thực hiện thay đổi trong mã nguồn.

### Các lệnh hữu ích khác

- **Build dự án cho Production:**
  ```bash
  yarn build
  ```
  Lệnh này sẽ tạo một thư mục `dist` chứa các file đã được tối ưu hóa để triển khai.

- **Chạy Lint để kiểm tra code:**
  ```bash
  yarn lint
  ```

- **Xem trước bản build production:**
  ```bash
  yarn preview
  ```

## Công nghệ sử dụng

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Quản lý trạng thái:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Sass](https://sass-lang.com/)
- **UI Library:** [Ant Design](https://ant.design/)
- **Data Fetching:** [Axios](https://axios-http.com/), [React Query (TanStack Query)](https://tanstack.com/query/v5)

## Cấu trúc thư mục chi tiết

Dưới đây là giải thích chi tiết về cấu trúc các file và thư mục quan trọng trong dự án.

### Các file cấu hình ở thư mục gốc

-   `.commitlintrc.js`: Cấu hình cho `commitlint`, giúp đảm bảo các commit message tuân thủ theo một quy chuẩn nhất định.
-   `.env`: Chứa các biến môi trường cho môi trường phát triển (development). File này **không nên** được đưa vào Git.
-   `.env.example`: File mẫu cho `.env`. Chứa danh sách các biến môi trường cần thiết cho dự án.
-   `eslint.config.js`: File cấu hình cho ESLint, công cụ phân tích code để tìm và sửa các vấn đề về phong cách và lỗi tiềm ẩn.
-   `package.json`: Chứa thông tin meta về dự án (tên, phiên bản) và danh sách các thư viện phụ thuộc (`dependencies` và `devDependencies`) cũng như các `scripts` để chạy (dev, build, lint...).
-   `vite.config.ts`: File cấu hình cho Vite, công cụ build và server phát triển của dự án.
-   `tailwind.config.js`: Cấu hình cho Tailwind CSS, cho phép bạn tùy chỉnh các class tiện ích, theme (màu sắc, font chữ...).
-   `postcss.config.js`: Cấu hình cho PostCSS, một công cụ để biến đổi CSS bằng các plugin JavaScript. Thường được dùng cùng với Tailwind CSS.
-   `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: Các file cấu hình cho TypeScript, định nghĩa cách trình biên dịch TypeScript kiểm tra và biên dịch code.
-   `yarn.lock`: Tự động được tạo bởi Yarn để "khóa" phiên bản chính xác của các gói phụ thuộc, đảm bảo môi trường cài đặt nhất quán giữa các máy phát triển.

### Thư mục `src`

Đây là nơi chứa toàn bộ mã nguồn của ứng dụng.

-   `main.tsx`: **Điểm bắt đầu (Entry Point)** của ứng dụng. File này render component `App` gốc vào trong DOM.
-   `router.tsx`: Định nghĩa các tuyến đường (routes) cho ứng dụng bằng `react-router-dom`, ánh xạ các URL tới các component `page` tương ứng.

-   `assets/`: Chứa các tài nguyên tĩnh.
    -   `images/`: Lưu trữ các file hình ảnh (PNG, JPG...).
    -   `svgs/`: Lưu trữ các file SVG.
    -   `styles/`: Chứa các file SCSS toàn cục như định nghĩa fonts, biến màu, layout chung.

-   `core/`: Chứa các phần mã nguồn cốt lõi, có thể tái sử dụng và chia sẻ trên toàn ứng dụng.
    -   `components/`: Nơi chứa các component React được chia theo kiến trúc Atomic Design.
        -   `atoms/`: Các component nhỏ nhất, không thể phân chia (ví dụ: Button, Input, Table).
        -   `organisms/`: Các nhóm component phức tạp hơn, tạo thành một phần của giao diện (ví dụ: Header, Sidebar).
        -   `templates/`: Các mẫu layout cho các trang (ví dụ: `AdminLayout`, `AuthLayout`).
    -   `config/`: Chứa các cấu hình cho các thư viện bên ngoài.
        -   `axios/`: Cấu hình cho `axios` instance, dùng để thực hiện các yêu cầu HTTP tới API, có thể chứa interceptor để xử lý token, lỗi...
        -   `i18n.ts`: Cấu hình cho `i18next` để hỗ trợ đa ngôn ngữ.
    -   `constants/`: Chứa các giá trị không đổi trong ứng dụng (hằng số).
        -   `url.ts`: Định nghĩa các hằng số URL endpoint của API.
        -   `menu.ts`: Cấu hình cho các mục trong menu/sidebar.
    -   `hooks/`: Chứa các React Hooks tùy chỉnh (custom hooks) để tái sử dụng logic (ví dụ: `useUser` để lấy thông tin người dùng).
    -   `interface/`: Định nghĩa các `interface` và `type` của TypeScript để đảm bảo tính nhất quán của dữ liệu.
    -   `redux/`: Logic quản lý trạng thái toàn cục bằng Redux Toolkit.
        -   `store.ts`: Nơi tạo Redux store chính.
        -   `rootReducer.ts`: Kết hợp tất cả các reducers lại với nhau.
        -   `features/`: Mỗi "feature" (tính năng) của ứng dụng sẽ có một "slice" riêng để quản lý trạng thái của nó (ví dụ: `authSlice`).
    -   `services/`: Lớp giao tiếp với API. Chứa các hàm gọi đến các endpoint cụ thể (ví dụ: `userAPI.ts` chứa các hàm để lấy, cập nhật thông tin người dùng).

-   `pages/`: Chứa các component đại diện cho một trang hoàn chỉnh. Mỗi file trong này thường tương ứng với một route được định nghĩa trong `router.tsx`.
    -   `Login/`: Component trang đăng nhập.
    -   `Profile/`: Component trang thông tin cá nhân.
    -   `NotFound/`: Component trang 404 Not Found.
