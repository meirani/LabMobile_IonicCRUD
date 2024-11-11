# Praktikum Pemograman Mobile Ionic CRUD
#### Nabila Winanda Meirani
#### H1D022108
#### Shift D

## Demo
![Demo Video](2024-11-11%2018-27-03.gif)

## Penjelasan CRUD

1. Membuat database
- Tabel Login
langkah pertama adalah membuat database coba-login pada phpmyadmin, lalu buat tabel dengan struktur sebagai berikut
```
CREATE TABLE user (
username varchar(100) NOT NULL,
password varchar(255) NOT NULL
);
INSERT INTO user (username, password) VALUES ('tes', MD5('tes123'));
```
tabel ini memuat field username dan password dengan data yang sudah tersedia, data inilah yang nantinya akan dipakai untuk login ke aplikasi.

- Tabel Mahasiswa
database selanjutnya yang perlu dibuat yaitu database db_mhs dengan tabel seperti dibawah ini
```
CREATE TABLE mahasiswa (
    id INT NOT NULL AUTO_INCREMENT,
    nama VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
```
terdapat 3 field yaitu id, nama, dan jurusan. Namun, yang dapat di create oleh user hanya nama dan jurusan saja karena id bersifat auto_increment


2. Membuat API koneksi.php dan file lainnya
-  Untuk login
```
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: PUT, GET, HEAD, POST, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding');
$con = mysqli_connect('localhost', 'root', '', 'coba-ionic') or die("koneksi gagal");
```
Code diatas merupakan code dari file koneksi.php, terdapat header yang mempunyai fungsi untuk mengizinkan domain untuk mengakses API, menentukan HTTP seperti PUT, GET, HEAD POST, DELETE, OPTIONS yang diperbolehkan mengakses API ini, menetapkan format respons JSON. Lalu terhadap variabel $con untuk membuat koneksi ke database mysql

-  Untuk CRUD mahasiswa
```
<?php
require 'koneksi.php';
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$pesan = [];
$username = trim($data['username']);
$password = md5(trim($data['password']));
$query = mysqli_query($con, "select * from user where username='$username' and
password='$password'");
$jumlah = mysqli_num_rows($query);
if ($jumlah != 0) {
    $value = mysqli_fetch_object($query);
    $pesan['username'] = $value->username;
    $pesan['token'] = time() . '_' . $value->password;
    $pesan['status_login'] = 'berhasil';
} else {
    $pesan['status_login'] = 'gagal';
}
echo json_encode($pesan);
echo mysqli_error($con);

```
file ini berfungsi untuk mengecek inputan dari user berupa username dan passwordnya apakah sama dengan data di database. file ini terhubung dengan koneksi.php dan akan mengirimkan token ke user.

3. File routing aplikasi 
```
const routes: Routes = [
  {
    path: 'mahasiswa',
    loadChildren: () => import('./mahasiswa/mahasiswa.module').then(m => m.MahasiswaPageModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
    canActivate: [autoLoginGuard]
  },
];
```
diatas adalah code routing untuk aplikasi ionic ini, terdapat 2 path yaitu untuk login dan mahasiswa, jika path nya '' atau 'login' akan diarahkan ke halaman login, jika user telah di autentifikasi maka dapat mengakses halaman mahasiswa dengan path 'mahasiswa'

4. Service 
-Authentication service untuk login
```
  async loadData() {
    const token = await Preferences.get({ key: TOKEN_KEY });
    const user = await Preferences.get({ key: USER_KEY });
    if (token && token.value && user && user.value) {
      this.token = token.value;
      this.nama = user.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  clearData() {
    this.token = '';
    this.nama = '';
    Preferences.remove({ key: TOKEN_KEY });
    Preferences.remove({ key: USER_KEY });
  }

  postMethod(data: any, link: any): Observable<any> {
    return this.http.post(this.apiURL() + '/' + link, data);
  }

  notifikasi(pesan: string) {
    return this.alert.create({
      header: 'Notifikasi',
      message: pesan,
      buttons: ['OK']
    }).then(res => {
      res.present();
    });
  }

  apiURL() {
    return 'http://coba-login.test:8080/';
  }

  logout() {
    this.isAuthenticated.next(false);
    this.clearData();
  }
}
```
diatas ini adalah fungsi-fungsi pada file authentication service. terdapat `loadData()` untuk mengambil data token dan user lalu menyimpannya jika berhasil, lalu `clearData()` untuk menghapus data token dan user atau mengosongkan informasi user, `postMethod(data, link)` untuk mengirim HTTP ke URL dan mengirimkan datanya, `notifikasi(pesan)` untuk menampilkan alert, `apiURL()` untuk mengembalikan atau menghubungkan ke API URL yaitu 'http://coba-login.test:8080/' terakhir fungsi `logout()` untuk mengatur autentifikasi menjadi false dan memanggil `clearData()`

- API service untuk CRUD mahasiswa
```
  apiURL() {
    return 'http://mahasiswa.test:8080/';
  }

  tambah(data: any, endpoint: string) {
    return this.http.post(this.apiURL() + '/' + endpoint, data);
  }

  edit(data: any, endpoint: string) {
    return this.http.put(this.apiURL() + '/' + endpoint, data);
  }

  tampil(endpoint: string): Observable<any> {
    return this.http.get(this.apiURL() + '/' + endpoint);
  }

  hapus(id: any, endpoint: string) {
    return this.http.delete(this.apiURL() + '/' + endpoint + '' + id);
  }

  lihat(id: any, endpoint: string) {
    return this.http.get(this.apiURL() + '/' + endpoint + '' + id);
  }
}
```
untuk file service mahasiswa ini berisi fungsi `apiURL()` yang menhbungkan ke API dengan alamat 'http://mahasiswa.test:8080/', lalu terdapat fungsi-funsi untuk create, read, update, delete atau CRUD seperti tambah, edit, tampil, hapus, lihat.

5. Fungsi untuk CRUD mahasiswa


6. Fungsi untuk login
7. Tampilan halaman
- Halaman Login
- Halaman Mahasiswa
8. Guards
- auth.guard.ts
- auto-login.guard.ts

