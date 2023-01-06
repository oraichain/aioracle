Collection verify similar
---

# Develop guide

1. Viết trong module api-key
1. User submit theo request `report/collection` => ghi nhận request của user
1. User có thể xem trạng thái quá trình xử lý qua url: `report/collection/status/{id-string_random}`
1. Sau khi user request thành công, lưu job vào redis -> craw server lấy job trong redis để thực thi -> craw tất cả nft của contract. craw thực hiện xong thì gửi request đến oracle server (`report/collection/{id}/sematic/internal`) để lưu total suply; đồng thời cũng gửi request api đến AI server để báo có request cần check verify theo collection (report_airight/verify_contract)
1. AI lưu job này vào queue để chạy ngầm. Mỗi khi verify 1 nft từ bộ collection -> gửi request đến oracle server (`report/collection/31/sematic/internal`) để lưu detail report: exact_match, near_exact, semantic. Lúc này oracle server tính toán để ra các con số flag red, consider, reliable theo nft vừa mới truyền lên.
1. Sau khi AI verify xong, thì cũng dùng api trên để truyền status done báo đã thực hiện xong -> oracle server: tổng hợp summary, detail file json gửi qua mail
