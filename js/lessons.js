// Auto-converted from DSA_Studio/src/lessons.json (29 lessons)
(function (root) {
  const LESSONS = [
  {
    "title": "Chọn cấu trúc dữ liệu và độ phức tạp",
    "group": "Nền tảng",
    "source": "S09 câu 6, 19-26; S02 câu 3",
    "problem": "Cần tra cứu phần tử thứ k của một dãy; cần tìm khóa trong AVL; cần đếm lá của một BST không lưu sẵn số lá. Độ phức tạp tương ứng là gì?",
    "reasoning": [
      "Xác định thao tác thực sự: truy cập theo chỉ số, đi theo một nhánh, hay phải khảo sát cả cây.",
      "Xác định giả thiết: mảng truy cập ngẫu nhiên; AVL cân bằng; số lá chưa được lưu sẵn."
    ],
    "solution": [
      "Mảng: a[k] truy cập O(1). Danh sách liên kết: muốn đến phần tử thứ k thường phải đi qua các nút trước, tệ nhất O(n).",
      "Tìm kiếm AVL: chiều cao O(log n), đi một đường nên tệ nhất O(log n). BST thường có thể lệch thành một dây, tìm kiếm tệ nhất O(n).",
      "Đếm lá bằng duyệt cây: O(n), kể cả cây cân bằng. Cân bằng không giúp bỏ qua các cây con cần đếm."
    ],
    "tip": "Hỏi “chèn vào giữa DSLK” phải xem đã có con trỏ đến vị trí chèn chưa: nối liên kết O(1); tìm vị trí rồi chèn có thể O(n). Quick Sort trung bình O(n log n), tệ nhất O(n²); không suy ra mọi trường hợp đều nhanh nhất.",
    "practice": "BST được tạo chỉ bằng chèn tăng dần 1, 2, ..., n, không cân bằng. Tìm n tệ nhất bao nhiêu?",
    "answer": "O(n): cây lệch phải, phải qua n nút.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 1
  },
  {
    "title": "Tìm kiếm tuyến tính và chỉ số mảng",
    "group": "Tìm kiếm",
    "source": "S03 câu 4; S04 câu 9",
    "problem": "Mảng a = [5, 10, 15, 20]. Hàm duyệt i từ 0, gặp a[i] == 15 thì return i, hết mảng thì return -1. Hàm trả về gì? Nếu tìm 25 thì sao?",
    "reasoning": [
      "Viết hàng chỉ số ngay trên hàng giá trị: 0, 1, 2, 3.",
      "Phân biệt giá trị tìm thấy với chỉ số được return. Khi gặp return, hàm dừng ngay."
    ],
    "solution": [
      "So sánh 5, rồi 10, rồi 15. Tìm 15: trả về 2 sau 3 lần so sánh khóa.",
      "Tìm 25: xét hết 4 phần tử, trả về -1.",
      "Với mảng [[1,2,3],[4,5,6]], số 4 ở chỉ số (1,0), nghĩa là hàng thứ hai, cột thứ nhất."
    ],
    "tip": "“Phần tử thứ 3” có chỉ số 2 nếu đánh số từ 0. Đừng chọn 15 khi hàm trả về vị trí. Nếu có giá trị lặp và return ngay, kết quả là lần xuất hiện đầu tiên theo thứ tự duyệt.",
    "practice": "Mảng [7, 2, 7, 9], tìm 7 bằng vòng lặp từ trái sang phải và return ngay: kết quả?",
    "answer": "Chỉ số 0, không phải 2.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 2
  },
  {
    "title": "Tìm kiếm nhị phân và lỗi điều kiện dừng",
    "group": "Tìm kiếm",
    "source": "S02 câu 2; S03 câu 5",
    "problem": "Tìm 14 trong [2, 5, 8, 11, 14, 17, 20]. Dùng đoạn đóng [low, high], mid = low + (high-low)//2. Ghi các mid đã xét.",
    "reasoning": [
      "Mảng tăng dần: khóa lớn hơn a[mid] thì bỏ nửa trái; nhỏ hơn thì bỏ nửa phải.",
      "Giữ low và high là hai vị trí vẫn có thể chứa khóa. Một vị trí còn lại vẫn cần được kiểm tra."
    ],
    "solution": [
      "low=0, high=6: mid=3, a[mid]=11 < 14, nên low=4.",
      "low=4, high=6: mid=5, a[mid]=17 > 14, nên high=4.",
      "low=4, high=4: mid=4, a[mid]=14. Trả về 4; có 3 lần xét phần tử giữa."
    ],
    "tip": "Với cách cập nhật high=mid-1, low=mid+1 và đoạn đóng, while phải là low <= high. Dùng < sẽ bỏ sót trường hợp chỉ còn một phần tử. Mảng giảm dần cần đảo hướng cập nhật; không áp dụng máy móc quy tắc trên.",
    "practice": "Mảng [3,6,9,12,15], tìm 12 theo cùng quy tắc. Các chỉ số mid là gì?",
    "answer": "2 rồi 3. Hai lần xét mid; kết quả chỉ số 3.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 3
  },
  {
    "title": "Nhận diện bốn thuật toán sắp xếp",
    "group": "Sắp xếp",
    "source": "S08 câu 4, 7-12",
    "problem": "Đoạn mã dùng min=i; quét j=i+1..n-1 để cập nhật min; sau khi quét xong mới đổi a[i] với a[min]. Đây là thuật toán gì?",
    "reasoning": [
      "Quan sát vị trí lệnh đổi chỗ: nằm trong vòng quét hay sau khi quét hết?",
      "Quan sát phần tử được so sánh: hai phần tử kề nhau, a[i] với mọi a[j], hay phần tử nhỏ nhất đang nhớ?"
    ],
    "solution": [
      "Đáp án: Selection Sort (chọn trực tiếp). Mỗi lượt chọn phần tử nhỏ nhất của đoạn chưa sắp rồi đưa về đầu đoạn.",
      "Bubble: so sánh/đổi hai vị trí kề nhau. Interchange: giữ i, gặp a[j] nhỏ hơn a[i] thì đổi ngay.",
      "Insertion: giữ x=a[i], dịch các phần tử lớn hơn x sang phải, rồi chèn x vào đoạn đầu đã có thứ tự."
    ],
    "tip": "Nhớ bốn động tác: CHỌN min; NỔI qua cặp kề; CHÈN x bằng dịch; ĐỔI NGAY với i. Một ảnh trạng thái sau một lượt đôi khi khớp nhiều thuật toán; khi đó cần toàn bộ chuỗi trạng thái hoặc mã giả.",
    "practice": "Giữ x=a[i], trong while gán a[pos+1]=a[pos], cuối cùng a[pos+1]=x. Thuật toán nào?",
    "answer": "Insertion Sort.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 4
  },
  {
    "title": "Interchange Sort: theo dõi từng phép đổi",
    "group": "Sắp xếp",
    "source": "S02 câu 1; S08 câu 10",
    "problem": "Sắp tăng [5, 3, 4, 1] bằng: với i từ 0 đến n-2, quét j=i+1..n-1; nếu a[i]>a[j] thì đổi ngay. Mảng sau vòng ngoài i=0?",
    "reasoning": [
      "Cố định i=0 nhưng giá trị a[0] thay đổi sau mỗi swap.",
      "Dùng mảng mới nhất cho lần so sánh kế tiếp; không so mọi phần tử với giá trị 5 ban đầu."
    ],
    "solution": [
      "j=1: 5>3, đổi thành [3,5,4,1].",
      "j=2: 3>4 sai, mảng giữ nguyên.",
      "j=3: 3>1, đổi thành [1,5,4,3]. Đây là kết quả sau toàn bộ lượt i=0."
    ],
    "tip": "Sau một lượt, a[i] đã là nhỏ nhất của đoạn đang xét. Nhưng phần đuôi không giống Selection Sort: Selection trên ví dụ này cho [1,3,4,5] sau lượt đầu. Chú ý đề hỏi sau một cặp (i,j) hay sau hết vòng ngoài.",
    "practice": "Cùng thuật toán, [6,2,5,1] sau i=0, j=1 vừa xử lý xong là gì?",
    "answer": "[2,6,5,1]. Chưa được chạy tiếp j=2,3.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 5
  },
  {
    "title": "Selection Sort: chọn min/max và biến chỉ số",
    "group": "Sắp xếp",
    "source": "S06 câu 13-14",
    "problem": "Dùng Selection Sort sắp giảm [27,40,-7,5,57]. Ghi mảng sau mỗi lượt chọn.",
    "reasoning": [
      "Sắp giảm nên chọn MAX trong đoạn chưa sắp. Chỉ đổi một lần sau khi tìm xong.",
      "Biến min/max trong nhiều đoạn code thực ra lưu chỉ số, không lưu giá trị."
    ],
    "solution": [
      "Lượt 1: chọn 57, đổi với 27: [57,40,-7,5,27].",
      "Lượt 2: 40 đã lớn nhất phần còn lại, không đổi.",
      "Lượt 3: chọn 27, đổi với -7: [57,40,27,5,-7]. Lượt 4 giữ nguyên."
    ],
    "tip": "Với n phần tử, bản chuẩn có n(n-1)/2 phép so sánh khóa, bất kể mảng ban đầu; số lần đổi chỗ thực sự tối đa n-1 nếu bỏ qua tự đổi. Không nhầm “min=6” với “giá trị nhỏ nhất bằng 6”.",
    "practice": "Sắp tăng [4,1,3,2] bằng Selection. Sau hai lượt ngoài i=0 và i=1?",
    "answer": "[1,2,3,4]. Lượt 1 [1,4,3,2]; lượt 2 đổi 4 với 2.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 6
  },
  {
    "title": "Insertion Sort: x, pos và trạng thái từng lượt",
    "group": "Sắp xếp",
    "source": "S05 câu 12",
    "problem": "Với [3,7,1,8,2,5], dùng code bên dưới. Sau khi hoàn thành lượt i=4, x, pos và mảng là gì?",
    "reasoning": [
      "Trước lượt i, đoạn a[0..i-1] đã tăng dần. x giữ giá trị cần chèn, không đổi theo các phép dịch.",
      "pos bắt đầu ở i-1 rồi giảm sau mỗi phép dịch. Vị trí chèn cuối là pos+1."
    ],
    "solution": [
      "Trước i=4: [1,3,7,8,2,5]. x=2, pos=3.",
      "Dịch 8, 7, 3 sang phải; pos lần lượt 2,1,0. Dừng vì a[0]=1 không lớn hơn 2.",
      "Chèn 2 vào a[1]. Kết quả: x=2, pos=0, mảng [1,2,3,7,8,5]."
    ],
    "tip": "Phải xác định thời điểm được hỏi. Ở đầu lượt pos=3; sau lượt pos=0. Câu gốc ghép pos ban đầu với mảng cuối lượt nên không nhất quán. Đếm dịch chuyển khác đếm mọi phép gán.",
    "practice": "Sắp [2,5,7,3] ở lượt i=3. Sau vòng while: x, pos và số lần dịch?",
    "answer": "x=3, pos=0, dịch 2 lần (7 và 5). Mảng cuối [2,3,5,7].",
    "code": "x = a[i];\npos = i - 1;\nwhile (pos >= 0 && a[pos] > x) {\n    a[pos+1] = a[pos];\n    pos--;\n}\na[pos+1] = x;",
    "table": null,
    "diagram": null,
    "id": 7
  },
  {
    "title": "Bubble Sort: mảng sau một hoặc nhiều lượt",
    "group": "Sắp xếp",
    "source": "S05 câu 11; S08 câu 5, 7-8",
    "problem": "Bubble tăng dần, quét j từ 0 đến n-i-2, đổi a[j],a[j+1] khi trái lớn hơn phải. Với [5,13,12,2,13,8], mảng sau lượt i=1?",
    "reasoning": [
      "i bắt đầu từ 0: sau i=1 là đã chạy HAI lượt.",
      "Quét trái sang phải làm giá trị lớn nhất phần đang xét nổi về cuối."
    ],
    "solution": [
      "Lượt i=0: [5,12,2,13,8,13]. Phần tử 13 cuối cùng đã đúng vị trí.",
      "Lượt i=1: so 5/12 giữ; 12/2 đổi; 12/13 giữ; 13/8 đổi.",
      "Mảng cuối lượt i=1: [5,2,12,8,13,13]."
    ],
    "tip": "Đánh dấu phần đuôi đã cố định sau mỗi lượt để giảm việc chép. Nếu code quét từ phải sang trái thì phần nhỏ nhất có thể về đầu; hãy theo chiều vòng lặp, không chỉ theo tên Bubble Sort.",
    "practice": "Bubble tăng, quét trái sang phải, [4,1,3,2] sau lượt i=0?",
    "answer": "[1,3,2,4].",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 8
  },
  {
    "title": "Đếm số hoán đổi bằng nghịch thế",
    "group": "Sắp xếp",
    "source": "S08 câu 5-6",
    "problem": "Bubble Sort tăng dần [4,1,3,2] cần bao nhiêu lần đổi hai phần tử kề nhau?",
    "reasoning": [
      "Một nghịch thế là một cặp i<j nhưng a[i]>a[j].",
      "Mỗi lần đổi một cặp kề đang ngược thứ tự loại bỏ đúng một nghịch thế. Mảng đã tăng có 0 nghịch thế."
    ],
    "solution": [
      "Sau 4 có ba số nhỏ hơn: 1,3,2 -> 3 cặp.",
      "Sau 1 không có số nhỏ hơn -> 0. Sau 3 có 2 -> 1 cặp. Tổng 3+0+1=4 lần swap.",
      "Với dãy n số phân biệt giảm hoàn toàn, số nghịch thế là n(n-1)/2."
    ],
    "tip": "Mẹo này dùng cho Bubble chuẩn và Insertion đổi kề. Với Insertion dịch phần tử, nó đếm số lần dịch, không phải tổng phép gán. Không dùng cho Selection/Interchange. Hai giá trị bằng nhau không tạo nghịch thế khi sắp không giảm.",
    "practice": "Dãy [5,4,3,1,2] có bao nhiêu nghịch thế?",
    "answer": "9. Dãy giảm 5 phần tử có 10 cặp; cặp 1,2 đã đúng thứ tự nên bớt 1.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 9
  },
  {
    "title": "Mảng hai chiều: sắp theo hàng, cột hoặc toàn bộ",
    "group": "Sắp xếp",
    "source": "S03 câu 6; S04 câu 7-8; S05 câu 10",
    "problem": "Mảng [[5,2,3],[1,9,4],[8,7,6]]. Đoạn code so arr[i][j] với arr[i][k], đổi khi vế trái lớn hơn. Kết quả?",
    "reasoning": [
      "Trong hai ô được so, chỉ số hàng i giữ nguyên. Vì vậy chỉ sắp bên trong từng hàng.",
      "Đổi khi trái lớn hơn phải nên đưa số nhỏ về trước: tăng dần."
    ],
    "solution": [
      "Hàng 0: [5,2,3] -> [2,3,5]. Hàng 1: [1,9,4] -> [1,4,9]. Hàng 2: [8,7,6] -> [6,7,8].",
      "Nếu so arr[i][j] với arr[k][j], cột j cố định: sắp theo cột. Với cùng mảng, sắp cột tăng cho [[1,2,3],[5,7,4],[8,9,6]].",
      "Nếu chép tất cả vào temp, sắp temp rồi điền lại theo hàng: [[1,2,3],[4,5,6],[7,8,9]]."
    ],
    "tip": "Nhìn chỉ số cố định trước khi chạy code. Đổi dấu > thành < trong kiểu đổi chỗ này sẽ đảo tăng thành giảm. Sắp từng hàng không có nghĩa cả ma trận tăng khi đọc nối các hàng.",
    "practice": "So arr[i][j] < arr[k][j] thì đổi hai ô. Đó là sắp theo hướng nào?",
    "answer": "Giảm dần theo từng cột: chỉ số cột j giữ nguyên.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 10
  },
  {
    "title": "Nhận diện danh sách đơn, đôi, vòng và rỗng",
    "group": "Danh sách liên kết",
    "source": "S11 câu 6-7, 10, 12; S09 câu 4, 9, 17, 25",
    "problem": "Một danh sách đôi không vòng có A <-> B <-> C, head=A, tail=C, không có nút lính canh. A.prev và C.next bằng gì? Nếu là danh sách đơn vòng thì C.next trỏ đâu?",
    "reasoning": [
      "Xác định “đơn/đôi” nói về số hướng liên kết; “vòng/không vòng” nói về cách nối cuối với đầu.",
      "Tách dữ liệu nút khỏi con trỏ liên kết. Các nút không nhất thiết nằm liên tiếp trong bộ nhớ."
    ],
    "solution": [
      "Đôi không vòng: A.prev=NULL, C.next=NULL.",
      "Đơn vòng, không rỗng: C.next=head, tức trỏ đến A.",
      "Danh sách đơn không có nút giả: head==NULL nghĩa là rỗng; head->next==NULL nghĩa là có đúng một nút nếu head khác NULL."
    ],
    "tip": "Có nút Header/lính canh thì điều kiện rỗng có thể khác: head tồn tại nhưng head->next==NULL. Danh sách đôi thường tốn thêm một con trỏ mỗi nút so với danh sách đơn cùng dữ liệu. Mảng động cũng có thể tăng kích thước, nên đừng học câu “mọi mảng đều cố định” như định lý.",
    "practice": "Danh sách đơn không vòng có đúng một nút X. head và tail là gì, X.next là gì?",
    "answer": "head=tail=địa chỉ X; X.next=NULL.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 11
  },
  {
    "title": "Chèn, xóa và giải phóng danh sách liên kết",
    "group": "Danh sách liên kết",
    "source": "S11 câu 1-3, 8-9, 13; S09 câu 14-15, 18, 29",
    "problem": "Cho A -> B -> C -> NULL, p trỏ B. Chèn nút X sau B rồi xóa X. Viết đúng thứ tự cập nhật liên kết.",
    "reasoning": [
      "Muốn chèn, giữ đường đi đến phần đuôi trước khi thay con trỏ của B.",
      "Muốn xóa, nối bỏ qua nút rồi mới giải phóng; không đọc dữ liệu qua con trỏ đã delete."
    ],
    "solution": [
      "Chèn: X->next=p->next; p->next=X; kết quả A -> B -> X -> C.",
      "Xóa nút ngay sau p: q=p->next; p->next=q->next; delete q; kết quả trở lại A -> B -> C.",
      "Thêm đầu: X->next=head; head=X. Hủy danh sách: giữ p=head; head=head->next; delete p; lặp đến NULL, rồi tail=NULL.",
      "Với danh sách đôi, xóa B ở giữa phải cập nhật cả A.next=C và C.prev=A."
    ],
    "tip": "Không dịch toàn bộ nút như mảng. Nếu xóa cuối, cập nhật tail; nếu xóa nút duy nhất, cả head và tail phải về NULL. Biết sẵn p thì nối/xóa sau p là O(1); tìm p có thể O(n).",
    "practice": "Nếu chèn X sau B mà làm p->next=X trước rồi X->next=p->next thì lỗi gì?",
    "answer": "X->next trỏ về chính X, tạo vòng tự nối và mất đường liên kết từ B đến phần đuôi cũ.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 12
  },
  {
    "title": "Lần theo con trỏ và đổi dữ liệu từng cặp",
    "group": "Danh sách liên kết",
    "source": "S11 câu 4-5; S07 câu 16",
    "problem": "Danh sách [1,2,3,4,5,6,7]. p ở nút đầu, q=p->next. Mỗi lượt đổi value của p,q; sau đó p=q->next; q=(p ? p->next : NULL). Kết quả?",
    "reasoning": [
      "Ghi rõ mỗi con trỏ đang ở NÚT nào. Code đổi value không đổi các mũi tên next.",
      "Mỗi lượt tiến sang cặp kế tiếp, không phải trượt một nút rồi đổi cặp chồng lấn."
    ],
    "solution": [
      "Cặp (1,2) -> [2,1,3,4,5,6,7].",
      "Cặp (3,4) -> [2,1,4,3,5,6,7].",
      "Cặp (5,6) -> [2,1,4,3,6,5,7]. Nút cuối 7 không có bạn ghép nên giữ nguyên."
    ],
    "tip": "Với bài in danh sách, phân biệt p->data với p->next->data, và kiểm tra điều kiện trước khi in. for(...); có dấu chấm phẩy ngay sau ngoặc tạo thân lặp rỗng. Hãy xác định nút giả Header có được tính là nút dữ liệu không.",
    "practice": "p bắt đầu tại A trong A->B->C->D; q trỏ D. Lặp while(p->next!=q) { in p->next; p=p->next; }. In gì?",
    "answer": "B rồi C. Khi p=C thì p->next=D=q nên dừng trước khi in D.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 13
  },
  {
    "title": "Đệ quy trên danh sách: lúc đi xuống và quay về",
    "group": "Danh sách liên kết",
    "source": "S06 câu 15; S07 câu 17-18",
    "problem": "Với 1 -> 2 -> 3 -> NULL, chạy hàm bên dưới. Thứ tự các số được in là gì?",
    "reasoning": [
      "Mỗi lời gọi giữ một p riêng. Lệnh trước lời gọi đệ quy chạy khi đi xuống; lệnh sau chạy khi quay về.",
      "Kiểm tra điều kiện dừng trước mọi phép p->... để tránh truy cập NULL."
    ],
    "solution": [
      "Đi xuống: in 1, gọi nút 2; in 2, gọi nút 3; in 3, gọi NULL rồi trở về.",
      "Quay về: in lại 3, rồi 2, rồi 1. Kết quả: 1 2 3 3 2 1.",
      "Nếu chỉ giữ printf sau lời gọi đệ quy, kết quả là 3 2 1. Danh sách vẫn giữ nguyên các liên kết; chỉ thứ tự in bị đảo."
    ],
    "tip": "Đệ quy nhảy p->next->next cần xét NULL kỹ. Trong câu gốc với 6 nút, lời gọi ở nút 5 đi đến NULL rồi dereference, nên không có kết quả chạy hợp lệ để khẳng định là “1 3 5”.",
    "practice": "Cùng hàm dưới đây nhưng danh sách [4,8]. Thứ tự in?",
    "answer": "4 8 8 4.",
    "code": "void f(Node* p) {\n    if (p == NULL) return;\n    printf(\"%d \", p->data);\n    f(p->next);\n    printf(\"%d \", p->data);\n}",
    "table": null,
    "diagram": null,
    "id": 14
  },
  {
    "title": "Stack: mô phỏng push, pop và đỉnh",
    "group": "Stack và queue",
    "source": "S08 câu 2, 13-14, 16-18; S12 câu 1, 4-5, 9, 12, 14-15",
    "problem": "Stack rỗng. Thực hiện push(1), push(2), pop(), push(3), push(2), pop(), push(2). Các phần tử từ top xuống bottom?",
    "reasoning": [
      "Quy ước ghi stack từ bottom sang top; phía phải là đỉnh. Push thêm bên phải, pop xóa bên phải.",
      "Đề hỏi trạng thái còn lại hay dãy giá trị đã pop là hai câu khác nhau."
    ],
    "solution": [
      "Các trạng thái: [] -> [1] -> [1,2] -> [1] -> [1,3] -> [1,3,2] -> [1,3] -> [1,3,2].",
      "Đọc ngược để trả lời top xuống bottom: 2,3,1. Đỉnh là 2, có 3 phần tử.",
      "Stack làm việc theo LIFO/FILO: vào sau, ra trước. Các thao tác thêm/lấy ở đỉnh."
    ],
    "tip": "Chỉ hỏi số phần tử: lấy số push trừ số pop thành công. Chỉ hỏi đỉnh: vẫn phải theo dõi giá trị. Nếu pop lúc rỗng, không tự coi đó là một phép xóa hợp lệ; xem đề xử lý lỗi thế nào.",
    "practice": "push(5), push(8), pop(), push(2), pop(): stack rỗng ban đầu còn gì?",
    "answer": "Còn [5]; top=5.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 15
  },
  {
    "title": "Queue: FIFO, hàng vòng và hàng ưu tiên",
    "group": "Stack và queue",
    "source": "S08 câu 15; S12 câu 3, 8, 11, 13, 16; S09 câu 26-27",
    "problem": "Queue rỗng. enqueue(A), enqueue(B), enqueue(C), dequeue(), enqueue(D). Front, rear và thứ tự lấy hết ra?",
    "reasoning": [
      "Ghi queue từ front sang rear. Thêm ở rear, lấy ở front.",
      "Phân biệt hàng thông thường, hàng mảng tịnh tiến và hàng vòng. Các chỉ số phụ thuộc cách cài đặt."
    ],
    "solution": [
      "Sau 3 lần thêm: [A,B,C]. Lấy ra A còn [B,C]. Thêm D thành [B,C,D].",
      "Front=B, rear=D; lấy hết theo thứ tự B,C,D.",
      "Hàng vòng có dung lượng 5, front=4, rear=1 cùng chỉ phần tử đầu/cuối, đang có 3 phần tử: dequeue làm front=(4+1)%5=0; rear vẫn 1.",
      "Hàng ưu tiên lấy phần tử ưu tiên cao nhất theo quy ước của đề; không nhất thiết FIFO."
    ],
    "tip": "Nếu xóa phần tử cuối làm hàng rỗng, cài đặt có thể đặt lại cả front và rear. Vì vậy không học câu “rear luôn không đổi khi xóa” cho mọi trường hợp. Số ưu tiên nhỏ hay lớn hơn được phục vụ trước phải xem đề.",
    "practice": "Hàng vòng dung lượng 6, rear=5, chưa đầy; enqueue thêm một phần tử thì rear mới?",
    "answer": "0, theo quy ước rear chỉ ô chứa phần tử cuối: (5+1)%6=0.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 16
  },
  {
    "title": "Chuyển phần tử giữa stack và queue",
    "group": "Stack và queue",
    "source": "S08 câu 3",
    "problem": "Stack S có top xuống bottom là 2,4,6; queue Q rỗng. Pop từng phần tử từ S đưa vào Q đến hết; rồi dequeue từng phần tử Q push trở lại S. S cuối cùng?",
    "reasoning": [
      "Viết hai chiều đọc rõ ràng: S theo top->bottom, Q theo front->rear.",
      "Đừng chỉ đếm phần tử: sự thay đổi nằm ở thứ tự lấy ra và đưa vào."
    ],
    "solution": [
      "Từ S sang Q: pop 2, rồi 4, rồi 6. Q front->rear là [2,4,6].",
      "Từ Q sang S: push 2, rồi 4, rồi 6. 6 được vào cuối nên ở đỉnh.",
      "S cuối top->bottom: 6,4,2. Toàn bộ chu trình đã đảo thứ tự stack."
    ],
    "tip": "Queue bảo toàn thứ tự đi qua; stack đảo thứ tự lúc lấy ra. Với nhiều lần chuyển, thử 3 ký hiệu A,B,C sẽ dễ thấy quy luật hơn làm ngay với dãy dài.",
    "practice": "S top->bottom là A,B,C,D, thực hiện đúng chu trình trên hai lần. Kết quả?",
    "answer": "A,B,C,D: mỗi chu trình đảo một lần; đảo hai lần trở lại thứ tự cũ.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 17
  },
  {
    "title": "Kiểm tra dấu ngoặc bằng stack",
    "group": "Stack và queue",
    "source": "S08 câu 1; biến thể mở rộng cùng nguyên lý",
    "problem": "Hai chuỗi ([{}]) và ([)] có hợp lệ về dấu ngoặc không?",
    "reasoning": [
      "Ngoặc mở push vào stack. Ngoặc đóng phải khớp với ngoặc mở gần nhất chưa đóng, tức ở top.",
      "Gặp đóng mà stack rỗng hoặc sai loại thì kết luận sai ngay. Cuối chuỗi stack phải rỗng."
    ],
    "solution": [
      "([{}]): push (, [, {; gặp } lấy {, gặp ] lấy [, gặp ) lấy (. Stack rỗng -> hợp lệ.",
      "([)]: sau hai ký tự đầu, top là [. Ký tự tiếp theo là ), không khớp [ -> không hợp lệ."
    ],
    "tip": "Đếm số ngoặc mở bằng số ngoặc đóng là chưa đủ: ([)] đếm cân nhưng lồng sai. Với chỉ một loại ngoặc, có thể dùng bộ đếm nhưng không được âm ở bất kỳ tiền tố nào; cuối cùng phải bằng 0.",
    "practice": "Chuỗi (() có hợp lệ không? Vì sao?",
    "answer": "Không. Kết thúc vẫn còn một ngoặc mở chưa được đóng.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 18
  },
  {
    "title": "Đổi trung tố sang hậu tố, tiền tố và cây biểu thức",
    "group": "Biểu thức",
    "source": "S12 câu 2; S01 câu 20, 34",
    "problem": "Đổi biểu thức ((a-b)/c)+(d*e) sang hậu tố và tiền tố; xác định gốc cây biểu thức.",
    "reasoning": [
      "Tìm phép toán thực hiện CUỐI CÙNG của toàn biểu thức: đó là +, nên + ở gốc.",
      "Giải từng biểu thức con: trái là (a-b)/c, phải là d*e. Ngoặc quyết định cách nhóm."
    ],
    "solution": [
      "Hậu tố: trái, phải, toán tử. (a-b) -> a b -; chia c -> a b - c /; cộng d*e -> a b - c / d e * +.",
      "Tiền tố: toán tử, trái, phải -> + / - a b c * d e.",
      "Cây biểu thức có gốc +; con trái / có con trái - và con phải c; - có a,b; con phải của + là * có d,e."
    ],
    "tip": "Hậu tố tương ứng duyệt LRN; tiền tố tương ứng NLR. Khi dùng stack đổi trực tiếp, xử lý ngoặc trước và ưu tiên * / cao hơn + -. Dấu trừ/chia cùng mức ưu tiên thường kết hợp trái, trừ khi đề định nghĩa khác.",
    "practice": "Hậu tố của a*(b+c)-d là gì?",
    "answer": "a b c + * d -",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 19
  },
  {
    "title": "Tính giá trị biểu thức hậu tố và tiền tố",
    "group": "Biểu thức",
    "source": "S12 câu 6-7, 10",
    "problem": "Tính hậu tố 8 3 2 * - 4 +. Biểu thức tiền tố tương đương là gì?",
    "reasoning": [
      "Hậu tố quét trái sang phải: gặp số thì push; gặp toán tử thì pop hai số.",
      "Số pop đầu là toán hạng PHẢI, số pop sau là toán hạng TRÁI: tính trái op phải."
    ],
    "solution": [
      "Push 8,3,2. Gặp *: lấy 2 rồi 3, tính 3*2=6, stack còn [8,6].",
      "Gặp -: lấy 6 rồi 8, tính 8-6=2. Push 4, gặp +: 2+4=6.",
      "Đáp án 6. Tiền tố tương đương: + - 8 * 3 2 4. Quét tiền tố từ phải sang trái; số pop đầu là toán hạng trái."
    ],
    "tip": "Trừ và chia dễ lộ lỗi đảo toán hạng; cộng/nhân có thể che lỗi đó. Kết thúc phải còn đúng một kết quả. Nếu gặp /, kiểm tra đề dùng chia nguyên hay số thực; trong C, 7/2 với hai số nguyên cho 3.",
    "practice": "Hậu tố 9 4 - 2 * có giá trị bao nhiêu?",
    "answer": "10: (9-4)*2.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 20
  },
  {
    "title": "Đọc hình cây: nút, bậc và các loại cây",
    "group": "Cây nhị phân và BST",
    "source": "S10 câu 1-3, 6, 12-14, 29; S09 câu 2-3, 7, 16",
    "problem": "Cây gốc 8, con trái 3, con phải 12; nút 3 có hai con 1 và 10. Cây này có phải BST không? Có bao nhiêu lá, bậc cây là bao nhiêu?",
    "reasoning": [
      "Nhị phân: mỗi nút có tối đa 2 con. BST: MỌI khóa trong cây con trái phải nhỏ hơn nút tổ tiên tương ứng, không chỉ con trực tiếp.",
      "Lá là nút không có con; bậc nút là số con trực tiếp; bậc cây là bậc nút lớn nhất."
    ],
    "solution": [
      "Cây là nhị phân, nhưng KHÔNG là BST: 10 nằm trong cây con trái của 8 mà 10>8.",
      "Các lá là 1,10,12: có 3 lá. Bậc cây là 2.",
      "Full/proper: mỗi nút có 0 hoặc 2 con. Perfect: mọi nút trong có 2 con, mọi lá cùng mức. Complete: kín các mức trừ mức cuối, mức cuối lấp từ trái. Cây mẫu full và complete, nhưng không perfect."
    ],
    "tip": "Tên tiếng Việt “đầy đủ/hoàn chỉnh” có thể được dùng khác nhau trong tài liệu: dựa vào định nghĩa hoặc hình. AVL phải vừa là BST vừa cân bằng tại MỌI nút; hình nhìn cân đối chưa đủ.",
    "practice": "Cây gốc 8, con trái 3, con phải 12; nút 3 chỉ có con phải 5. Có full không?",
    "answer": "Không: nút 3 có đúng một con.",
    "code": null,
    "table": null,
    "diagram": [
      "badbst"
    ],
    "id": 21
  },
  {
    "title": "Chiều cao, mức, số nút và số lá",
    "group": "Cây nhị phân và BST",
    "source": "S01 câu 1-3; S10 câu 4-5, 13",
    "problem": "Cây nhị phân có 31 nút. Chiều cao nhỏ nhất là bao nhiêu? Nếu có 4 mức thì nhiều nhất bao nhiêu lá?",
    "reasoning": [
      "Chốt quy ước: h đếm số CẠNH trên đường dài nhất; L đếm số MỨC, gốc ở mức 1. Với cây không rỗng: L=h+1.",
      "Cây càng đầy các mức thì chứa được nhiều nút với cùng chiều cao."
    ],
    "solution": [
      "Cây h cạnh có tối đa 2^(h+1)-1 nút; L mức có tối đa 2^L-1 nút.",
      "31=2^5-1 -> L nhỏ nhất=5, tương đương h nhỏ nhất=4.",
      "Với L=4 mức, số lá tối đa 2^(L-1)=8. Nếu h=4 cạnh thì tối đa 16 lá.",
      "Công thức: L_min=ceil(log2(n+1)); h_min=L_min-1. Đường đi dài k cạnh chứa k+1 nút."
    ],
    "tip": "Tài liệu gốc có chỗ dùng mức, chỗ dùng cạnh. Không học riêng số “4” hay “5”. Với n>=1, chiều cao lớn nhất là n-1 cạnh khi cây thành một dây. Công thức số nút cực đại là đạt được ở cây perfect, không đúng cho mọi cây full.",
    "practice": "Cây perfect có chiều cao 3 cạnh: số mức, số nút và số lá?",
    "answer": "4 mức; 15 nút; 8 lá.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 22
  },
  {
    "title": "Duyệt cây NLR, LNR, LRN và theo mức",
    "group": "Cây nhị phân và BST",
    "source": "S01 câu 5-13, 23-24; S10 câu 8, 10-11, 15, 17, 19-21, 24",
    "problem": "Cây gốc 8, trái 3 với con 1,6; phải 10 với con phải 14. Viết bốn thứ tự duyệt.",
    "reasoning": [
      "N là nút đang xét, L là toàn cây con trái, R là toàn cây con phải. Áp dụng cùng quy tắc đệ quy cho từng cây con.",
      "Duyệt theo mức đi từ trên xuống, cùng mức từ trái sang phải; thường dùng queue."
    ],
    "solution": [
      "NLR (trước): 8,3,1,6,10,14.",
      "LNR (giữa): 1,3,6,8,10,14.",
      "LRN (sau): 1,6,3,14,10,8.",
      "Theo mức: 8,3,10,1,6,14. Nút thứ 4 trong NLR là 6."
    ],
    "tip": "NLR có gốc đầu; LRN có gốc cuối. LNR của BST khóa phân biệt là dãy tăng: có thể sắp khóa để trả lời nhanh, không cần dựng cây. Không áp dụng mẹo tăng dần cho cây nhị phân bất kỳ.",
    "practice": "Với cây mẫu, nút thứ 4 trong LRN là gì?",
    "answer": "14. Dãy LRN là 1,6,3,14,10,8.",
    "code": null,
    "table": null,
    "diagram": [
      "bst"
    ],
    "id": 23
  },
  {
    "title": "Dựng cây từ hai dãy duyệt",
    "group": "Cây nhị phân và BST",
    "source": "S01 câu 21; S10 câu 16, 18",
    "problem": "NLR = B A D C F E và LNR = A B C D E F. Tìm LRN. Các nhãn đều khác nhau.",
    "reasoning": [
      "Phần tử đầu NLR là gốc B. Tách LNR tại B: trái [A], phải [C,D,E,F].",
      "Số phần tử bên trái cho biết lấy bao nhiêu phần tử tiếp trong NLR dành cho cây trái. Lặp lại cho từng cây con."
    ],
    "solution": [
      "Cây trái của B chỉ có A. Cây phải có NLR D C F E, nên gốc là D.",
      "Trong LNR cây phải, tách tại D: trái [C], phải [E,F]. Cây phải của D có gốc F và con trái E.",
      "LRN: cây trái A; cây phải C E F D; cuối cùng B. Đáp án A C E F D B."
    ],
    "tip": "Có LRN và LNR: lấy phần tử CUỐI LRN làm gốc rồi tách tương tự. Với nhãn phân biệt, NLR+LNR hoặc LRN+LNR xác định duy nhất cây. Chỉ NLR+LRN nói chung chưa đủ để xác định vị trí con một phía.",
    "practice": "NLR A B D C; LNR D B A C. LRN là gì?",
    "answer": "D B C A.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 24
  },
  {
    "title": "BST: dựng cây, chèn, tìm và đếm bước",
    "group": "Cây nhị phân và BST",
    "source": "S01 câu 31-33; S10 câu 23-27",
    "problem": "Chèn lần lượt 3,6,5,2,4,7,1 vào BST rỗng, không tự cân bằng. Nút nào sâu nhất? Tìm 4 đi qua những nút nào?",
    "reasoning": [
      "Số đầu tiên là gốc. Mỗi số mới bắt đầu từ gốc: nhỏ đi trái, lớn đi phải, gặp chỗ rỗng thì gắn vào.",
      "Mỗi lần tìm cũng đi đúng đường so sánh đó. Không sắp lại dãy trước khi dựng cây."
    ],
    "solution": [
      "Gốc 3; trái 2 (trái 1); phải 6 (trái 5, phải 7); nút 5 có trái 4.",
      "Nút sâu nhất là 4. Đường 3 -> 6 -> 5 -> 4 có 3 cạnh, 4 nút được xét.",
      "Với BST chỉ tạo bằng chèn, không xoay hay xóa, cha được chèn trước con. Quy tắc này không còn luôn đúng nếu cây đã xoay AVL."
    ],
    "tip": "Đề nói “số bước tìm” thường muốn số nút xét, còn “độ dài đường đi” thường đếm cạnh. Nếu hỏi số phép so sánh trong code, có thể mỗi nút thực hiện nhiều phép so sánh; đọc đúng yêu cầu.",
    "practice": "Cùng cây, chèn 8 thì 8 là con nào của nút nào?",
    "answer": "Con phải của 7: đường 3 -> 6 -> 7 -> chỗ trống bên phải.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 25
  },
  {
    "title": "Xóa BST và chọn phần tử thế mạng",
    "group": "Cây nhị phân và BST",
    "source": "S01 câu 22, 35-37; S10 câu 9, 22, 30",
    "problem": "BST có gốc 8; cây trái gồm 3 với hai con 1,5 và 5 có con phải 6; cây phải là 12. Xóa 8, chọn thế mạng bên trái. Chọn nút nào?",
    "reasoning": [
      "Xóa lá: bỏ liên kết đến lá. Xóa nút có một con: nối cha trực tiếp đến con đó.",
      "Xóa nút có hai con: chọn lớn nhất cây trái (tiền nhiệm) hoặc nhỏ nhất cây phải (kế nhiệm), theo yêu cầu."
    ],
    "solution": [
      "Đi sang trái từ 8 đến 3, sau đó đi phải tối đa: 3 -> 5 -> 6. Nút thế mạng là 6.",
      "Đưa khóa 6 lên vị trí 8, rồi xóa nút 6 ở vị trí cũ. Trong ví dụ này 6 cũ là lá.",
      "Nếu chọn bên phải thì lấy nhỏ nhất cây phải: 12. Không chọn tùy ý một nút “gần gốc”."
    ],
    "tip": "Nhớ “trái rồi phải mãi; phải rồi trái mãi”. Nút thế mạng có thể còn một con: khi xóa vị trí cũ phải nối con đó lên. BST thường không tự xoay sau xóa; AVL thì còn cần cân bằng.",
    "practice": "Gốc 20, cây phải là 30 có con trái 25, và 25 có con phải 27. Xóa 20 lấy thế mạng phải: chọn gì, nối 27 ra sao?",
    "answer": "Chọn 25. Sau khi đưa khóa 25 lên gốc, xóa nút 25 cũ và đặt 30.left=27.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 26
  },
  {
    "title": "Đọc hàm đệ quy trên cây",
    "group": "Cây nhị phân và BST",
    "source": "S10 câu 7; S02 câu 3",
    "problem": "Hàm f(NULL)=0; nếu nút không có con thì trả 1; các nút khác trả f(left)+f(right). Hàm tính gì? Áp dụng cho cây gốc 8, trái 3 có con 1,6, phải 10 có con phải 14.",
    "reasoning": [
      "Đọc điều kiện trả về trước: nút rỗng đóng góp 0, nút lá đóng góp 1.",
      "Đọc cách kết hợp hai cây con: cộng số lượng hay lấy max độ cao?"
    ],
    "solution": [
      "Hàm đếm lá. Lá 1,6,14 đóng góp tổng 3.",
      "Đếm mọi nút thường là 1+count(left)+count(right), với rỗng bằng 0.",
      "Chiều cao theo số mức thường là 1+max(height(left),height(right)), với cây rỗng bằng 0. Cây mẫu có 3 mức.",
      "Các hàm này duyệt từng nút: O(n). Bộ nhớ ngăn xếp lời gọi O(h), với h là chiều cao."
    ],
    "tip": "Nhìn biểu thức return: “cộng và cộng thêm 1” đếm nút; “max và cộng 1” tính cao; “chỉ lá trả 1” đếm lá. Đừng suy từ tên hàm abc/f mà phải nhìn điều kiện.",
    "practice": "Hàm rỗng trả 0, nút thường trả 1+f(left)+f(right), gọi trên cây mẫu có kết quả?",
    "answer": "6: cây có các nút 8,3,1,6,10,14.",
    "code": null,
    "table": null,
    "diagram": null,
    "id": 27
  },
  {
    "title": "AVL: kiểm tra cân bằng và xoay khi chèn",
    "group": "AVL",
    "source": "S01 câu 14, 16, 25-30; S10 câu 6, 28; S09 câu 6, 8, 11, 23",
    "problem": "Chèn lần lượt 30,10,20 vào AVL rỗng. Cần xoay kiểu nào? Gốc cuối là gì?",
    "reasoning": [
      "Chèn như BST trước. Đi ngược đường vừa chèn, tính BF=h(trái)-h(phải). Mọi nút AVL phải có BF thuộc {-1,0,1}.",
      "Tại nút mất cân bằng thấp nhất, nhìn hai hướng đi đến nút mới để nhận LL, RR, LR hoặc RL."
    ],
    "solution": [
      "Sau chèn: gốc 30 có trái 10, và 10 có phải 20. Nút 30 có BF=2: trái cao hơn 2.",
      "Đường 30 -> 10 -> 20 là trái-phải (LR). Xoay trái tại 10, rồi xoay phải tại 30.",
      "Kết quả gốc 20, trái 10, phải 30. Với dãy dài, cân bằng ngay sau TỪNG lần chèn rồi mới chèn số tiếp theo."
    ],
    "tip": "LL -> xoay phải tại nút mất cân bằng; RR -> xoay trái; LR -> trái ở con trái rồi phải ở nút; RL -> phải ở con phải rồi trái ở nút. LL/RR là hướng lệch, không phải hướng xoay. Sau xoay, LNR vẫn giữ nguyên.",
    "practice": "Chèn 10,30,20 vào AVL rỗng: kiểu xoay và gốc cuối?",
    "answer": "RL: xoay phải tại 30, rồi trái tại 10. Gốc 20, hai con 10 và 30.",
    "code": null,
    "table": [
      [
        "Kiểu lệch",
        "Thao tác cân bằng"
      ],
      [
        "LL",
        "Xoay phải tại nút lệch"
      ],
      [
        "RR",
        "Xoay trái tại nút lệch"
      ],
      [
        "LR",
        "Trái ở con trái, rồi phải tại nút lệch"
      ],
      [
        "RL",
        "Phải ở con phải, rồi trái tại nút lệch"
      ]
    ],
    "diagram": null,
    "id": 28
  },
  {
    "title": "AVL: xóa và cân bằng lại",
    "group": "AVL",
    "source": "S01 câu 15, 17-19; S09 câu 12",
    "problem": "AVL gốc 30, trái 20 có hai con 10 và 25, phải 40 là lá. Xóa 40. Gốc cuối là gì?",
    "reasoning": [
      "Xóa như BST, sau đó cập nhật chiều cao từ nơi xóa đi lên. Không mặc định xóa xong phải xoay: chỉ xoay nơi |BF|>1.",
      "Khi cây lệch trái, xét BF của con trái. Xóa có thể gặp BF(con)=0; đây vẫn là trường hợp xoay đơn."
    ],
    "solution": [
      "Sau xóa 40: 30 có cây trái cao 2 mức, cây phải rỗng, BF(30)=2. BF(20)=0 vì hai con đều là lá.",
      "Xoay phải tại 30. Nút 20 lên gốc; 10 vẫn bên trái; 30 thành con phải của 20; 25 chuyển thành con trái của 30.",
      "Kết quả gốc 20. LNR sau xóa là 10,20,25,30, vẫn tăng dần."
    ],
    "tip": "Lệch trái: BF(con trái)>=0 thì xoay phải, <0 thì xoay kép LR. Lệch phải: BF(con phải)<=0 thì xoay trái, >0 thì RL. Sau xóa có thể cần cân bằng nhiều tổ tiên; hãy tiếp tục đi lên.",
    "practice": "AVL gốc 20, trái 10 là lá, phải 30 có hai con 25 và 40. Xóa 10: gốc cuối?",
    "answer": "30. BF(20)=-2, BF(30)=0 -> xoay trái tại 20; 25 trở thành con phải của 20.",
    "code": null,
    "table": null,
    "diagram": [
      "avldelete"
    ],
    "id": 29
  }
];
  root.DSA_LESSONS = LESSONS;
  if (typeof module !== "undefined" && module.exports) module.exports = LESSONS;
})(typeof window !== "undefined" ? window : globalThis);
