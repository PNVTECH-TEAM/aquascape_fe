# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Aquascape AI Platform - Frontend

This is the frontend for the Aquascape AI Platform, built with React, Vite, TypeScript, and Ant Design.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

Before you begin, ensure you have the following tools installed on your system:

-   **Node.js**: Version 18.x or later. You can download it from [nodejs.org](https://nodejs.org/).
-   **Yarn**: A package manager for Node.js. After installing Node.js, you can install Yarn globally by running:
    ```sh
    npm install -g yarn
    ```

### 2. Installation

Clone the repository to your local machine, navigate into the project directory, and install the required dependencies.

```sh
# Navigate to the project's root directory
# and install dependencies
yarn install
```

### 3. Environment Configuration

The project uses environment variables to connect to the backend API.

1.  In the project's root directory, create a copy of the `.env.example` file and name it `.env`.
    -   On Windows (PowerShell):
        ```sh
        copy .env.example .env
        ```
    -   On macOS/Linux:
        ```sh
        cp .env.example .env
        ```
2.  Open the newly created `.env` file and update the variables to match your local environment. Specifically, ensure `VITE_BASE_URL_API` points to your running backend server.

    ```dotenv
    VITE_APP_NAME='AICP'
    VITE_SHORT_APP_NAME='PNVTECH'
    VITE_NAME='Aquascape AI Platform'
    
    # Update this URL to your backend API endpoint
    VITE_BASE_URL_API=http://localhost:6002/api
    VITE_BACKEND_URL=http://localhost:6002
    ```

### 4. Running the Application

Once the setup is complete, you can run the development server:

```sh
yarn dev
```

This will start the application on a local port (usually `http://localhost:5001`). Open this URL in your browser to see the application. The server supports Hot Module Replacement (HMR), so the page will automatically reload when you save changes to the source code.

### 5. Available Scripts

-   `yarn dev`: Runs the app in development mode.
-   `yarn build`: Builds the app for production to the `dist` folder.
-   `yarn lint`: Lints the code using ESLint to check for code quality and style issues.
-   `yarn preview`: Serves the production build locally for previewing.

---
## 🇻🇳 Hướng dẫn Bắt đầu

Làm theo các hướng dẫn sau để cài đặt và chạy dự án trên máy tính của bạn cho mục đích phát triển và thử nghiệm.

### 1. Yêu cầu Hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:

-   **Node.js**: Phiên bản 18.x trở lên. Tải về tại [nodejs.org](https://nodejs.org/).
-   **Yarn**: Trình quản lý gói. Sau khi cài Node.js, bạn có thể cài Yarn bằng lệnh:
    ```sh
    npm install -g yarn
    ```

### 2. Cài đặt

Sao chép (clone) repository về máy, di chuyển vào thư mục gốc của dự án và cài đặt các gói phụ thuộc.

```sh
# Di chuyển vào thư mục gốc của dự án
# và cài đặt các gói phụ thuộc
yarn install
```

### 3. Cấu hình Biến môi trường

Dự án sử dụng biến môi trường để kết nối với API backend.

1.  Trong thư mục gốc, tạo một bản sao của file `.env.example` và đổi tên thành `.env`.
    -   Trên Windows (PowerShell):
        ```sh
        copy .env.example .env
        ```
    -   Trên macOS/Linux:
        ```sh
        cp .env.example .env
        ```
2.  Mở file `.env` vừa tạo và cập nhật các giá trị để phù hợp với môi trường local của bạn. Đặc biệt, hãy đảm bảo `VITE_BASE_URL_API` trỏ đến backend server đang chạy.

    ```dotenv
    VITE_APP_NAME='AICP'
    VITE_SHORT_APP_NAME='ST'
    VITE_NAME='Aquascape AI Platform'
    
    # Cập nhật URL này thành địa chỉ API backend của bạn
    VITE_BASE_URL_API=http://localhost:6002/api
    VITE_BACKEND_URL=http://localhost:6002
    ```

### 4. Chạy Ứng dụng

Sau khi hoàn tất cài đặt, bạn có thể khởi động server phát triển:

```sh
yarn dev
```

Lệnh này sẽ khởi động ứng dụng trên một cổng local (thường là `http://localhost:5001`). Mở URL này trên trình duyệt để xem ứng dụng. Server hỗ trợ tự động tải lại trang khi bạn lưu thay đổi.

### 5. Các lệnh có sẵn

-   `yarn dev`: Chạy ứng dụng ở chế độ phát triển.
-   `yarn build`: Build ứng dụng cho môi trường production vào thư mục `dist`.
-   `yarn lint`: Kiểm tra chất lượng code bằng ESLint.
-   `yarn preview`: Chạy bản build production ở local để xem trước.

---

## 📂 Project Structure

Here is an overview of the directory structure and the purpose of each main folder inside the `src` directory.

```
src/
├── assets/         # Static assets like images, fonts, and global styles.
├── core/           # Core application logic, containing shared modules.
│   ├── components/ # Reusable React components (Atoms, Molecules, etc.).
│   ├── config/     # Application-wide configurations (i18n, axios).
│   ├── constants/  # Constant values (API URLs, keys, etc.).
│   ├── helpers/    # Helper functions.
│   ├── hooks/      # Custom React hooks (e.g., useUser).
│   ├── interface/  # TypeScript type definitions and interfaces.
│   ├── redux/      # Redux state management (store, reducers, slices).
│   ├── routes/     # Route definitions (public and private).
│   └── services/   # API service layers for communicating with the backend.
├── pages/          # Page components, each corresponding to a specific route.
├── main.tsx        # The main entry point of the application.
└── router.tsx      # The main router configuration for the entire app.
```

-   **`src/assets`**: Chứa các tài sản tĩnh như hình ảnh, icon, font chữ, và các file SCSS toàn cục (`_variable.scss`, `_fonts.scss`).
-   **`src/core`**: Thư mục cốt lõi chứa phần lớn logic của ứng dụng, được chia thành các module con.
    -   **`core/components`**: Chứa các component React có thể tái sử dụng, được tổ chức theo kiến trúc Atomic Design (atoms, molecules, organisms, templates).
    -   **`core/config`**: Chứa các file cấu hình cho toàn bộ dự án, ví dụ như `i18n` cho đa ngôn ngữ hoặc `axios` cho việc gọi API.
    -   **`core/constants`**: Định nghĩa các giá trị không đổi được sử dụng trong toàn ứng dụng như URL của API, các key, ...
    -   **`core/helpers`**: Chứa các hàm hỗ trợ (helper functions) nhỏ lẻ.
    -   **`core/hooks`**: Nơi định nghĩa các custom React hook để tái sử dụng logic (ví dụ: `useUser`).
    -   **`core/interface`**: Định nghĩa các `interface` và `type` của TypeScript để đảm bảo an toàn kiểu dữ liệu.
    -   **`core/redux`**: Chứa mọi thứ liên quan đến Redux, bao gồm store, reducers, và các slices.
    -   **`core/routes`**: Định nghĩa các mảng route công khai (`public`) và riêng tư (`private`).
    -   **`core/services`**: Chứa các lớp dịch vụ để giao tiếp với API backend.
-   **`src/pages`**: Chứa các component trang chính. Mỗi file trong này thường tương ứng với một route (ví dụ: `Dashboard`, `LoginPage`).
-   **`src/main.tsx`**: File khởi đầu của ứng dụng, nơi React được render vào DOM và các `Provider` (Redux, React Query) được thiết lập.
-   **`src/router.tsx`**: File cấu hình routing chính, nơi tất cả các route của ứng dụng được định nghĩa và lồng vào nhau.

---

## 🇻🇳 Cấu trúc Thư mục

Dưới đây là tổng quan về cấu trúc thư mục và mục đích của từng thư mục chính bên trong `src`.

```
src/
├── assets/         # Tài sản tĩnh như hình ảnh, font, và style toàn cục.
├── core/           # Logic cốt lõi của ứng dụng, chứa các module con.
│   ├── components/ # Các component React tái sử dụng (Atoms, Molecules, ...).
│   ├── config/     # Cấu hình toàn cục (i18n, axios).
│   ├── constants/  # Các hằng số (API URLs, keys, ...).
│   ├── helpers/    # Các hàm hỗ trợ.
│   ├── hooks/      # Các custom React hook (e.g., useUser).
│   ├── interface/  # Các interface và type của TypeScript.
│   ├── redux/      # Quản lý state bằng Redux (store, reducers, slices).
│   ├── routes/     # Định nghĩa route (public và private).
│   └── services/   # Các lớp dịch vụ API để giao tiếp với backend.
├── pages/          # Các component trang, tương ứng với một route cụ thể.
├── main.tsx        # File khởi đầu (entry point) của ứng dụng.
└── router.tsx      # File cấu hình router chính cho toàn bộ ứng dụng.
```

-   **`src/assets`**: Contains static assets like images, icons, fonts, and global SCSS files (`_variable.scss`, `_fonts.scss`).
-   **`src/core`**: The core directory containing the majority of the application's logic, divided into sub-modules.
    -   **`core/components`**: Contains reusable React components, organized by Atomic Design architecture (atoms, molecules, organisms, templates).
    -   **`core/config`**: Contains project-wide configuration files, such as `i18n` for multi-language support or `axios` for API calls.
    -   **`core/constants`**: Defines constant values used throughout the application, like API URLs, keys, etc.
    -   **`core/helpers`**: Contains small helper functions.
    -   **`core/hooks`**: A place to define custom React hooks for reusable logic (e.g., `useUser`).
    -   **`core/interface`**: Defines TypeScript `interface` and `type` definitions to ensure type safety.
    -   **`core/redux`**: Contains everything related to Redux, including the store, reducers, and slices.
    -   **`core/routes`**: Defines the `public` and `private` route arrays.
    -   **`core/services`**: Contains service layers for communicating with the backend API.
-   **`src/pages`**: Contains the main page components. Each file here typically corresponds to a route (e.g., `Dashboard`, `LoginPage`).
-   **`src/main.tsx`**: The application's entry point, where React is rendered into the DOM and providers (Redux, React Query) are set up.
-   **`src/router.tsx`**: The main routing configuration file, where all application routes are defined and nested.
