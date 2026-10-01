# 🎤 HƯỚNG DẪN THUYẾT TRÌNH DỰ ÁN REACT NATIVE (CHUYÊN SÂU VỀ COMPONENT)
## Đề tài: Phân Tích & Ứng Dụng Các Core Component Trong Xây Dựng Giao Diện React Native (App TechZone Store)

---

## 📌 MỤC LỤC
1. [Mục Tiêu & Định Hướng Bài Thuyết Trình](#1-mục-tiêu--định-hướng-bài-thuyết-trình)
2. [Cây Phân Cấp Component (Component Tree Architecture)](#2-cây-phân-cấp-component-component-tree-architecture)
3. [Phân Tích Chi Tiết 8 Core Component Cốt Lõi Trong Dự Án](#3-phân-tích-chi-tiết-8-core-component-cốt-lõi-trong-dự-án)
   - [1. SafeAreaView & StatusBar (Vùng an toàn & Thanh trạng thái)](#1-safeareaview--statusbar)
   - [2. View & Flexbox Layout (Khung chứa & Bố cục đa chiều)](#2-view--flexbox-layout)
   - [3. Text (Xử lý chuỗi, định dạng & phòng chống tràn chữ)](#3-text)
   - [4. TextInput (Ô nhập liệu tương tác thời gian thực)](#4-textinput)
   - [5. Image (Hiển thị ảnh tối ưu & xử lý co giãn)](#5-image)
   - [6. FlatList Ngang (Bộ lọc danh mục dạng Chips)](#6-flatlist-ngang-category-filter)
   - [7. FlatList Dọc & ListEmptyComponent (Danh sách cuộn ảo hóa & Trạng thái rỗng)](#7-flatlist-dọc--listemptycomponent)
   - [8. Pressable (Xử lý chạm đa trạng thái thế hệ mới)](#8-pressable)
4. [Kịch Bản Thuyết Trình Chi Tiết Từng Phút (Kèm Lời Thoại Mẫu)](#4-kịch-bản-thuyết-trình-chi-tiết-từng-phút-kèm-lời-thoại-mẫu)
   - [Phần 1: Mở đầu & Giới thiệu Cây Component (2 phút)](#phần-1-mở-đầu--giới-thiệu-cây-component-2-phút)
   - [Phần 2: Thuyết minh chuyên sâu từng Component qua Code (5 - 6 phút)](#phần-2-thuyết-minh-chuyên-sâu-từng-component-qua-code-5---6-phút)
   - [Phần 3: Demo tính năng gắn liền với Component đang hoạt động (3 phút)](#phần-3-demo-tính-năng-gắn-liền-với-component-đang-hoạt-động-3-phút)
   - [Phần 4: Kết luận & Bài học kinh nghiệm (1 phút)](#phần-4-kết-luận--bài-học-kinh-nghiệm-1-phút)
5. [Bảng So Sánh Chuyên Sâu Các Component Tương Đương](#5-bảng-so-sánh-chuyên-sâu-các-component-tương-đương)
6. [Bộ Câu Hỏi Phản Biện Chuyên Sâu Về Component (Q&A)](#6-bộ-câu-hỏi-phản-biện-chuyên-sâu-về-component-qa)

---

## 1. MỤC TIÊU & ĐỊNH HƯỚNG BÀI THUYẾT TRÌNH

Bài thuyết trình này tập trung **100% vào trọng tâm Component**:
- Chứng minh khả năng hiểu rõ bản chất, đặc tính kỹ thuật và các **Props cốt lõi** của từng Core Component trong React Native.
- Giải thích vì sao chọn Component này thay vì Component khác (VD: `FlatList` thay vì `ScrollView`, `Pressable` thay vì `TouchableOpacity`).
- Minh họa sự phối hợp giữa **Component phân tầng (Hierarchy)**, **Props truyền vào** và **Quản lý State bên trong Component**.

---

## 2. CÂY PHÂN CẤP COMPONENT (COMPONENT TREE ARCHITECTURE)

Dưới đây là sơ đồ kiến trúc cây phân cấp các Component được tổ chức chặt chẽ trong ứng dụng:

```
SafeAreaView (Bảo vệ vùng an toàn tai thỏ / notch)
 └── StatusBar (Tùy biến thanh pin, sóng, icon)
 └── View [mainContainer] (Nền xám #f8fafc, flex: 1)
      │
      ├── View [header] (flexDirection: 'row', justifyContent: 'space-between')
      │    ├── View (Chứa tiêu đề)
      │    │    ├── Text [headerTitle] ("TechZone Store")
      │    │    └── Text [headerSubtitle]
      │    └── Pressable [cartIconWrapper] (Nút giỏ hàng)
      │         ├── Text [cartIcon] ("🛍️")
      │         └── View [badge] -> Text [badgeText] (Số lượng đơn hàng)
      │
      ├── View [searchSection] (Khu vực tìm kiếm)
      │    └── View [searchBar] (flexDirection: 'row', alignItems: 'center')
      │         ├── Text ("🔍")
      │         ├── TextInput (Nhập từ khóa, onChangeText, clearButtonMode)
      │         └── Pressable [clearButton] (Nút ✕ xóa nhanh khi có text)
      │              └── Text ("✕")
      │
      ├── View [categoryContainer] (Bộ lọc danh mục)
      │    └── FlatList [horizontal=true] (Cuộn ngang các danh mục)
      │         └── renderItem: Pressable [categoryChip] (Đổi màu khi chọn)
      │              └── Text [categoryChipText]
      │
      ├── View [resultSummary] (Báo cáo kết quả)
      │    └── Text (Hiển thị số lượng tìm được, lồng thẻ Text in đậm)
      │
      └── FlatList [listContent] (Danh sách sản phẩm cuộn dọc ảo hóa)
           ├── renderItem: View [cardContainer] (Card từng sản phẩm)
           │    ├── View [imageWrapper] (Khung ảnh bo tròn)
           │    │    ├── Image (Ảnh sản phẩm từ URI CDN, resizeMode="cover")
           │    │    └── View [discountBadge] -> Text ("-X%")
           │    │
           │    └── View [productInfo] (Khung thông tin sản phẩm)
           │         ├── View [tagRow] -> Text [categoryBadge] + Text [rating]
           │         ├── Text [productName] (numberOfLines={2})
           │         ├── Text [productDesc] (numberOfLines={1})
           │         ├── View [priceRow] -> Text [currentPrice] + Text [oldPrice]
           │         └── Pressable [buyButton] (Xử lý trạng thái pressed)
           │              └── Text [buyButtonText] ("🛒 Mua ngay" / "Đang thêm...")
           │
           └── ListEmptyComponent: View [emptyContainer] (Hiển thị khi kết quả rỗng)
                ├── Text ("🔎")
                ├── Text ("Không tìm thấy sản phẩm")
                ├── Text (Mô tả hướng dẫn)
                └── Pressable [resetButton] -> Text ("Xem tất cả sản phẩm")
```

---

## 3. PHÂN TÍCH CHI TIẾT 8 CORE COMPONENT CỐT LÕI TRONG DỰ ÁN

### 1. `SafeAreaView` & `StatusBar`
- **Vị trí trong mã nguồn:** Bọc ngoài cùng giao diện và cấu hình đỉnh màn hình.
- **Vai trò:**
  - `SafeAreaView`: Tự động căn lề (padding/margin) để nội dung ứng dụng không bị che khuất bởi các thành phần vật lý của thiết bị như: "Tai thỏ" (Notch), "Dynamic Island" trên iPhone hoặc thanh điều hướng ảo ở đáy màn hình.
  - `StatusBar`: Đồng bộ giao diện với thanh trạng thái của hệ điều hành điện thoại (`barStyle="dark-content"`, `backgroundColor="#ffffff"`).
- **Điểm kỹ thuật đặc thù:**
  - Trên Android, `SafeAreaView` mặc định không tự tính chiều cao của thanh trạng thái. Do đó, mã nguồn xử lý bù trừ chuẩn xác qua thuộc tính:
    ```javascript
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    ```

---

### 2. `View` & Flexbox Layout
- **Vị trí trong mã nguồn:** Xuất hiện ở hầu hết mọi khối giao diện (`header`, `cardContainer`, `priceRow`,...).
- **Vai trò:**
  - Là component container cơ bản nhất trong React Native, tương đương với `<div>` trong HTML nhưng chỉ hỗ trợ bố cục dựa trên **Flexbox**.
- **Điểm khác biệt cốt lõi so với Web:**
  - Trong React Native, thuộc tính `flexDirection` mặc định luôn là `'column'` (thay vì `'row'` như CSS Web).
  - Dự án tận dụng triệt để `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'` để dàn hàng ngang tiêu đề, thanh tìm kiếm, và căn chỉnh giá tiền - nút bấm.

---

### 3. `Text`
- **Vị trí trong mã nguồn:** Tên sản phẩm, giá tiền, nhãn danh mục, mô tả sản phẩm,...
- **Quy tắc sống còn trong React Native:**
  - Không được đặt chuỗi ký tự (raw string) trực tiếp bên trong thẻ `View`. Mọi chuỗi văn bản bắt buộc phải nằm trong thẻ `Text`.
- **Các Props kỹ thuật nổi bật được ứng dụng:**
  - `numberOfLines={2}`: Giới hạn tên sản phẩm hiển thị tối đa 2 dòng. Nếu tên quá dài, React Native tự động thêm dấu `...` (ellipsis) ở cuối, giúp kích thước các Card sản phẩm luôn đồng đều và không bị vỡ giao diện.
  - `numberOfLines={1}`: Áp dụng cho dòng mô tả ngắn của sản phẩm.
  - **Lồng thẻ Text (Inline Text Nesting):**
    ```javascript
    <Text style={styles.resultText}>
      Hiển thị <Text style={styles.boldText}>{filteredProducts.length}</Text> sản phẩm
    </Text>
    ```
    Giúp tạo kiểu in đậm một từ cụ thể ngay trong một dòng văn bản mà không làm gãy dòng.

---

### 4. `TextInput`
- **Vị trí trong mã nguồn:** Thanh tìm kiếm sản phẩm trên Header.
- **Vai trò:** Tiếp nhận văn bản nhập từ bàn phím ảo của người dùng theo thời gian thực.
- **Các Props cấu hình quan trọng:**
  - `value={searchQuery}` & `onChangeText={setSearchQuery}`: Tạo cơ chế **Controlled Component** trong React, đồng bộ dữ liệu người dùng gõ vào State tức thì.
  - `placeholder="Nhập tên sản phẩm cần tìm..."` & `placeholderTextColor="#9ca3af"`: Hướng dẫn người dùng trực quan.
  - `autoCapitalize="none"`: Tắt tự động viết hoa chữ cái đầu, tối ưu cho việc gõ từ khóa tìm kiếm.
  - `clearButtonMode="while-editing"`: Tự động hiển thị icon xóa mặc định trên hệ điều hành iOS.

---

### 5. `Image`
- **Vị trí trong mã nguồn:** Hiển thị ảnh đại diện của từng sản phẩm trong Card.
- **Đặc tính kỹ thuật:**
  - Tải ảnh từ đường dẫn mạng (Network Image) thông qua đối tượng `source={{ uri: item.image }}`. Khác với ảnh tĩnh cục bộ (`require('./image.png')`), ảnh tải từ URI **bắt buộc phải khai báo kích thước (`width`, `height`)** trong StyleSheet, nếu không ảnh sẽ không hiển thị.
  - `resizeMode="cover"`: Đảm bảo hình ảnh lấp đầy toàn bộ khung chứa `imageWrapper`, giữ đúng tỉ lệ gốc mà không làm méo hình.

---

### 6. `FlatList` Ngang (Category Filter)
- **Vị trí trong mã nguồn:** Thanh lọc danh mục nằm dưới thanh tìm kiếm.
- **Điểm sáng kỹ thuật:**
  - Sử dụng thuộc tính `horizontal={true}` (viết tắt là `horizontal`) để biến danh sách dọc thành thanh trượt ngang mượt mà.
  - `showsHorizontalScrollIndicator={false}`: Ẩn thanh cuộn xấu xí, mang lại trải nghiệm như một ứng dụng Native cao cấp.
  - `contentContainerStyle`: Căn chỉnh khoảng cách lề hai đầu (`paddingHorizontal: 16`) mà không làm co giật danh sách.

---

### 7. `FlatList` Dọc & `ListEmptyComponent`
- **Vị trí trong mã nguồn:** Danh sách sản phẩm chính của ứng dụng.
- **Tại sao FlatList là "ngôi sao" của hiệu năng?**
  - **Cơ chế Virtualized List:** Khác với `ScrollView` (tải hết 100% dữ liệu vào RAM ngay lập tức), `FlatList` chỉ render các phần tử nằm trong khung nhìn (Viewport) và lập tức hủy/tái chế các phần tử bị cuộn khuất khỏi tầm mắt. Điều này giữ cho FPS của app luôn duy trì ở mức 60 FPS ngay cả khi có hàng nghìn sản phẩm.
- **Prop `ListEmptyComponent`:**
  - Một tính năng cực kỳ mạnh mẽ của `FlatList`: Tự động render giao diện thông báo rỗng khi mảng `data` rỗng (ví dụ: khi người dùng tìm kiếm một từ khóa không tồn tại).
  - Tích hợp sẵn nút `Pressable` giúp reset bộ lọc, nâng cao trải nghiệm người dùng (UX).

---

### 8. `Pressable`
- **Vị trí trong mã nguồn:** Nút "Mua ngay", nút "Xóa từ khóa ✕", các Chip danh mục, và Icon giỏ hàng.
- **Sự vượt trội so với `TouchableOpacity` truyền thống:**
  - `Pressable` là Component mới được React Native chuẩn hóa. Cho phép nhận hàm callback `({ pressed }) => [...]` ở cả prop `style` lẫn `children`.
  - Giúp thay đổi trực quan giao diện khi tay người dùng chạm vào:
    ```javascript
    <Pressable
      style={({ pressed }) => [styles.buyButton, pressed && styles.buyButtonPressed]}
      onPress={() => handleBuyPress(item)}
    >
      {({ pressed }) => (
        <Text style={styles.buyButtonText}>
          {pressed ? 'Đang thêm...' : '🛒 Mua ngay'}
        </Text>
      )}
    </Pressable>
    ```
  - Thuộc tính `hitSlop={8}` ở nút xóa: Giúp mở rộng vùng cảm ứng chạm xung quanh nút `✕` thêm 8 pixel mà không cần làm phình to kích thước giao diện hiển thị.

---

## 4. KỊCH BẢN THUYẾT TRÌNH CHI TIẾT TỪNG PHÚT (KÈM LỜI THOẠI MẪU)

### PHẦN 1: MỞ ĐẦU & GIỚI THIỆU CÂY COMPONENT (2 phút)

* **Hành động:** Trình chiếu sơ đồ cây Component.
* **Lời thoại mẫu:**
  > *"Kính chào Thầy/Cô và các bạn. Hôm nay em xin đại diện nhóm trình bày đề tài: **Phân tích và phối hợp các Core Component trong xây dựng giao diện ứng dụng React Native thông qua dự án TechZone Store**.*
  >
  > *Trong React Native, giao diện không được tạo bởi các thẻ HTML như `div`, `p`, `img` mà được xây dựng từ một hệ thống các **Core Component** trừu tượng hóa, sau đó ánh xạ trực tiếp sang các UI Component gốc của Android (như `ViewGroup`, `TextView`) và iOS (như `UIView`, `UILabel`).*
  >
  > *Để ứng dụng đạt được độ hoàn thiện cao, nhóm em đã thiết kế cây Component phân tầng rõ rệt: Bọc ngoài cùng là `SafeAreaView` và `StatusBar`, khung thân là `View` điều hướng bằng Flexbox, các luồng dữ liệu tương tác gồm `TextInput`, bộ đôi `FlatList` ngang - dọc, và toàn bộ thao tác chạm đều được xử lý bằng `Pressable`."*

---

### PHẦN 2: THUYẾT MINH CHUYÊN SÂU TỪNG COMPONENT QUA CODE (5 - 6 phút)

* **Hành động:** Mở mã nguồn `App.js` và lần lượt chỉ vào các đoạn code then chốt.
* **Lời thoại mẫu:**

  > **1. Về SafeAreaView và StatusBar (Dòng 204 - 208):**  
  > *"Điểm đầu tiên em muốn lưu ý là `SafeAreaView`. Đối với các thiết bị có tai thỏ hay Dynamic Island, nếu không có `SafeAreaView`, nội dung sẽ bị đè lên thanh trạng thái. Đặc biệt, vì Android không tự động né status bar như iOS, tụi em đã sử dụng `Platform.OS === 'android'` để bù thêm `StatusBar.currentHeight`."*

  > **2. Về TextInput & Controlled State (Dòng 242 - 259):**  
  > *"Tiếp theo là ô tìm kiếm sử dụng `TextInput`. Đây là một **Controlled Component**, giá trị `value` được kiểm soát hoàn toàn bởi State `searchQuery`. Tụi em bổ sung một component con là `Pressable` nút ✕ với prop `hitSlop={8}` để người dùng dễ bấm xóa từ khóa ngay trên màn hình cảm ứng nhỏ."*

  > **3. Về FlatList ngang lọc danh mục (Dòng 263 - 292):**  
  > *"Ở phần danh mục, thay vì dùng `ScrollView` tĩnh, nhóm dùng `FlatList` với prop `horizontal`. Mỗi mục danh mục được bọc trong một `Pressable` đóng vai trò là một Chip Button. Khi danh mục được chọn (`isSelected`), style sẽ linh hoạt chuyển sang màu xanh chủ đạo `categoryChipActive`."*

  > **4. Về FlatList dọc & Cơ chế ảo hóa (Dòng 303 - 328):**  
  > *"Đây là Component quan trọng nhất của ứng dụng: `FlatList` danh sách sản phẩm. Nhóm sử dụng `FlatList` thay vì `ScrollView` nhằm tận dụng cơ chế **Virtualized List** – chỉ vẽ những sản phẩm đang xuất hiện trên màn hình, giúp tiết kiệm bộ nhớ RAM tối đa.*
  > *Đặc biệt, prop `ListEmptyComponent` được thiết kế hoàn chỉnh với hình ảnh minh họa và nút bấm reset, tự động xuất hiện khi không có kết quả tìm kiếm."*

  > **5. Về Card sản phẩm: Phối hợp Image, Text và Pressable (Dòng 142 - 200):**  
  > *"Bên trong hàm `renderProductItem`, chúng ta thấy sự phối hợp nhịp nhàng giữa:*
  > *- `Image`: Được cấp URL từ CDN, cố định `resizeMode="cover"` giúp hình ảnh không bị méo tỉ lệ.*
  > *- `Text`: Được khống chế bằng `numberOfLines={2}` cho tên sản phẩm và `numberOfLines={1}` cho mô tả, chống hiện tượng vỡ layout.*
  > *- `Pressable`: Nút 'Mua ngay' ứng dụng kỹ thuật `pressed state`. Khi bấm giữ, nút vừa đổi sang màu đậm hơn, vừa đổi chữ thành 'Đang thêm...', mang lại trải nghiệm phản hồi xúc giác rất tự nhiên."*

---

### PHẦN 3: DEMO TÍNH NĂNG GẮN LIỀN VỚI COMPONENT ĐANG HOẠT ĐỘNG (3 phút)

* **Hành động:** Thao tác trên thiết bị / trình duyệt và giải thích Component tương ứng đang chạy ngầm.

| Thao tác trên màn hình | Giải thích Component đang xử lý phía dưới |
|---|---|
| **Kéo cuộn trang lên xuống** | `FlatList` đang liên tục tái chế bộ nhớ cho các phần tử sản phẩm (Recycle Views). |
| **Gõ chữ "Sony" vào ô tìm kiếm** | `TextInput` kích hoạt `onChangeText` -> cập nhật state `searchQuery` -> `useMemo` tính toán lại -> `FlatList` re-render danh sách. |
| **Gõ từ khóa không có thật "laptop 999"** | `FlatList` phát hiện `data.length === 0` -> Kích hoạt `ListEmptyComponent` hiển thị giao diện rỗng. |
| **Bấm nút "Xem tất cả sản phẩm"** | `Pressable` bên trong `ListEmptyComponent` kích hoạt hàm xóa state tìm kiếm. |
| **Chạm và giữ nút "Mua ngay"** | `Pressable` lập tức kích hoạt trạng thái `pressed === true`, đổi nhãn sang "Đang thêm..." và đổi màu nền. |
| **Nhìn góc trên bên phải** | Badge số lượng (kết hợp giữa `View` bo tròn `borderRadius: 9` và `Text` số đếm) tự động tăng lên. |

---

### PHẦN 4: KẾT LUẬN & BÀI HỌC KINH NGHIỆM (1 phút)

* **Lời thoại mẫu:**
  > *"Qua quá trình xây dựng dự án TechZone Store, nhóm đã rút ra những bài học then chốt về Component trong React Native:*
  > *1. Luôn hiểu rõ cơ chế hiển thị của từng Core Component trên cả iOS và Android.*
  > *2. Đối với danh sách dữ liệu động, luôn ưu tiên `FlatList` kèm `ListEmptyComponent` thay vì `ScrollView`.*
  > *3. Sử dụng `Pressable` để mang lại tương tác chạm hiện đại và linh hoạt.*
  > *4. Khống chế chặt chẽ giới hạn hiển thị của `Text` bằng `numberOfLines` để đảm bảo giao diện luôn bền vững.*
  >
  > *Em xin chân thành cảm ơn Thầy/Cô và các bạn đã theo dõi!"*

---

## 5. BẢNG SO SÁNH CHUYÊN SÂU CÁC COMPONENT TƯƠNG ĐƯƠNG

Hội đồng thường rất thích hỏi so sánh để kiểm tra kiến thức nền tảng của bạn:

| Tiêu chí | `FlatList` | `ScrollView` |
|---|---|---|
| **Cơ chế hoạt động** | **Ảo hóa (Virtualization):** Chỉ render các phần tử đang nhìn thấy trên màn hình. | **Render toàn bộ:** Vẽ tất cả các phần tử trong danh sách ngay từ đầu. |
| **Tiêu tốn bộ nhớ** | Cực kỳ thấp, duy trì ổn định dù danh sách 100 hay 10.000 sản phẩm. | Tăng đột biến theo số lượng phần tử, dễ gây tràn RAM (Crash ứng dụng). |
| **Phù hợp cho** | Danh sách sản phẩm, tin tức, bảng tin dữ liệu lớn từ API. | Màn hình cài đặt (Settings), Form đăng ký tĩnh có độ dài ngắn. |

---

| Tiêu chí | `Pressable` (Được dùng trong App) | `TouchableOpacity` (Cũ hơn) |
|---|---|---|
| **Khả năng tùy biến** | Cung cấp hàm `({ pressed })` cho cả `style` và `children`. Cho phép đổi chữ, màu sắc, viền, kích thước. | Chỉ hỗ trợ duy nhất hiệu ứng giảm độ mờ (opacity) khi nhấn. |
| **Độ chính xác** | Hỗ trợ cấu hình `hitSlop`, `pressRetentionOffset`, các sự kiện `onPressIn`, `onPressOut`, `onLongPress` tối ưu. | Cấu hình hạn chế hơn, hiệu năng không tối ưu bằng `Pressable` trên các phiên bản React Native mới. |
| **Khuyến nghị từ Meta** | Là chuẩn mực mới được khuyến nghị thay thế các họ `Touchable`. | Được duy trì vì lý do tương thích ngược với code cũ. |

---

| Tiêu chí | `Text` trong React Native | Thẻ `<p>`, `<span>` trong Web HTML |
|---|---|---|
| **Kế thừa Style** | **Không tự động kế thừa:** Khai báo `color` hay `fontSize` ở thẻ `View` cha sẽ KHÔNG tác động tới thẻ `Text` con. | Tự động kế thừa thuộc tính font chữ từ thẻ cha (CSS Inheritance). |
| **Văn bản trần** | Bắt buộc 100% chữ phải nằm trong `<Text>`. Viết chữ ngoài `<View>` sẽ gây lỗi văng app (Red Screen Crash). | Cho phép viết chữ tự do bên trong `<div>` hoặc bất kỳ thẻ nào. |

---

## 6. BỘ CÂU HỎI PHẢN BIỆN CHUYÊN SÂU VỀ COMPONENT (Q&A)

### ❓ Câu 1: Tại sao trong `Image`, nếu lấy ảnh từ URL trên mạng bắt buộc phải set chiều rộng và chiều cao cố định trong Style?
> **Trả lời:**  
> Vì khi ứng dụng khởi chạy, ảnh trên mạng chưa được tải về máy nên React Native không thể biết trước kích thước thực (kích thước pixel tự nhiên) của bức ảnh. Nếu không định nghĩa trước `width` và `height`, component `Image` sẽ có kích thước mặc định là 0x0 và không hiển thị gì trên màn hình.

---

### ❓ Câu 2: Trong `FlatList`, thuộc tính `keyExtractor` có vai trò gì và nếu không truyền thì sao?
> **Trả lời:**  
> - `keyExtractor` dùng để chỉ định khóa định danh duy nhất (Unique Key) cho mỗi item trong danh sách (trong app dùng `(item) => item.id`).
> - Khóa này giúp thuật toán React Reconciliation nhận diện chính xác item nào đã được thêm, sửa, hoặc xóa để chỉ re-render đúng phần tử đó mà không phải vẽ lại toàn bộ danh sách.
> - Nếu không khai báo `keyExtractor`, React Native sẽ mặc định tìm trường `key` hoặc `id` có sẵn trong object, hoặc dùng chỉ số mảng `index` (dễ gây lỗi giao diện khi danh sách bị sắp xếp lại).

---

### ❓ Câu 3: Làm thế nào để giải quyết vấn đề chữ quá dài làm bể khung sản phẩm (Card)?
> **Trả lời:**  
> Nhóm sử dụng thuộc tính `numberOfLines={2}` trên component `Text` của tên sản phẩm. Khi tên sản phẩm vượt quá 2 dòng, React Native sẽ tự động cắt ngắn phần dư thừa và thêm dấu chấm lửng `...`. Đồng thời kết hợp với `ellipsizeMode="tail"` (mặc định), giữ cho chiều cao các Card sản phẩm luôn đồng đều và ngay ngắn.

---

### ❓ Câu 4: Sự khác nhau giữa `contentContainerStyle` và `style` thông thường trong `FlatList` là gì?
> **Trả lời:**  
> - `style`: Áp dụng cho khung nhìn bao ngoài của `FlatList` (Viewport).
> - `contentContainerStyle`: Áp dụng trực tiếp lên bề mặt vùng chứa có thể cuộn của danh sách bên trong. Tụi em dùng `contentContainerStyle` để tạo khoảng đệm lề (`paddingHorizontal: 16`, `paddingBottom: 24`), giúp các sản phẩm đầu và cuối không bị dính sát mép màn hình khi cuộn.

---

### ❓ Câu 5: Tại sao nút giỏ hàng và thanh Badge đỏ lại được lồng nhiều lớp `View` và `Text` như vậy?
> **Trả lời:**  
> Đó là ứng dụng của kỹ thuật **Absolute Positioning** trong Flexbox của React Native:
> - Khung ngoài `cartIconWrapper` được đặt `position: 'relative'`.
> - Khung `badge` số lượng được đặt `position: 'absolute'`, căn chỉnh `top: -2, right: -2`.
> Nhờ đó, dù icon giỏ hàng ở bất kỳ đâu, huy hiệu đỏ chứa component `Text` số lượng sản phẩm vẫn luôn bám chính xác vào góc trên bên phải của icon giỏ hàng.
