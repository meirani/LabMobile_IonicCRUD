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
```
  getMahasiswa() {
    this.api.tampil('tampil.php').subscribe({
      next: (res: any) => {
        console.log('sukses', res);
        this.dataMahasiswa = res.filter((item: any) => 
          item && item.nama && item.jurusan && 
          item.nama.trim() !== '' && item.jurusan.trim() !== ''
        );
      },
      error: (err: any) => {
        console.log('Error:', err);
        this.alertController.create({
          header: 'Error',
          message: 'Gagal mengambil data: ' + err.message,
          buttons: ['OK']
        }).then(alert => alert.present());
      },
    });
  }

  async konfirmasiHapus(id: any) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure want to delete this data?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Hapus dibatalkan');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.hapusMahasiswa(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async tambahMahasiswa() {
    if (this.namaMahasiswa != '' && this.jurusan != '') {
      let data = {
        nama: this.namaMahasiswa,
        jurusan: this.jurusan,
      }
      this.api.tambah(data, 'tambah.php')
        .subscribe({
          next: async (hasil: any) => {
            this.modalTambah = false;
            this.modal.dismiss();
            this.resetModal();
            await new Promise(resolve => {
              this.getMahasiswa();
              resolve(true);
            });

            const alert = await this.alertController.create({
              header: 'Success',
              message: `Data mahasiswa ${this.namaMahasiswa} successfully added`,
              buttons: ['OK']
            });
  
            await alert.present();
          },
          error: async (err: any) => {
            console.log('gagal tambah mahasiswa');

            const alert = await this.alertController.create({
              header: 'Error',
              message: 'Gagal menambahkan data mahasiswa',
              buttons: ['OK']
            });
  
            await alert.present();
          }
        })
    } else {
      const alert = await this.alertController.create({
        header: 'Peringatan',
        message: 'Nama dan jurusan harus diisi',
        buttons: ['OK']
      });
  
      await alert.present();
      console.log('gagal tambah mahasiswa karena masih ada data yg kosong');
    }
  }

  hapusMahasiswa(id: any) {
    this.api.hapus(id,
      'hapus.php?id=').subscribe({
        next: (res: any) => {
          console.log('Success', res);
          this.getMahasiswa();
          console.log('Data has been deleted');
        },
        error: (error: any) => {
          console.log('gagal');
        }
      })
  }

  ambilMahasiswa(id: any) {
    this.api.lihat(id,
      'lihat.php?id=').subscribe({
        next: (hasil: any) => {
          console.log('sukses', hasil);
          let mahasiswa = hasil;
          this.id = mahasiswa.id;
          this.namaMahasiswa = mahasiswa.nama;
          this.jurusan = mahasiswa.jurusan;
        },
        error: (error: any) => {
          console.log('gagal ambil data');
        }
      })
  }

  async editMahasiswa() {
    if (this.namaMahasiswa != '' && this.jurusan != '') {
      let data = {
        id: this.id,
        nama: this.namaMahasiswa,
        jurusan: this.jurusan
      }
      this.api.edit(data, 'edit.php')
        .subscribe({
          next: async (hasil: any) => {
            console.log(hasil);
            this.resetModal();
            this.getMahasiswa();
            console.log('berhasil edit Mahasiswa');
            this.modalEdit = false;
            this.modal.dismiss();

            const alert = await this.alertController.create({
              header: 'Success',
              message: `Data ${this.namaMahasiswa} successfully updated`,
              buttons: ['OK']
            });
  
            await alert.present();
          },
          error: async (err: any) => {
            console.log('gagal edit Mahasiswa');
            
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'Gagal mengubah data mahasiswa',
              buttons: ['OK']
            });
  
            await alert.present();
          }
        })
    } else {
      const alert = await this.alertController.create({
        header: 'Peringatan',
        message: 'Nama dan jurusan harus diisi',
        buttons: ['OK']
      });
  
      await alert.present();
      console.log('gagal edit mahasiswa karena masih ada data yg kosong');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
```
Di atas ini adalah fungsi-fungsi pada file mahasiswa/mahasiswa.page.ts. Terdapat `getMahasiswa()` yang mengambil data mahasiswa dari API (`tampil.php`) dan menyimpannya ke dalam `dataMahasiswa` setelah memfilter data kosong. Kemudian ada `konfirmasiHapus(id)`, yang menampilkan konfirmasi untuk menghapus data mahasiswa dengan ID tertentu. Jika dikonfirmasi, fungsi `hapusMahasiswa(id)` akan dipanggil untuk menghapus data mahasiswa dari API (`hapus.php?id=`) dan memuat ulang data mahasiswa. lalu, `tambahMahasiswa()` digunakan untuk menambah data mahasiswa baru ke API (`tambah.php`). Jika berhasil, notifikasi sukses ditampilkan, jika gagal, akan muncul pesan error. Fungsi `ambilMahasiswa(id)` mengambil data mahasiswa berdasarkan ID dari API (`lihat.php?id=`) dan menyimpannya untuk diedit. Fungsi `editMahasiswa()` mengirim data yang telah diedit ke API (`edit.php`) untuk memperbarui data mahasiswa, dengan notifikasi sukses atau error sesuai hasilnya.


6. Fungsi untuk login
```
login() {
    if (this.username != null && this.password != null) {
      const data = {
        username: this.username,
        password: this.password
      }
      this.authService.postMethod(data, 'login.php').subscribe({
        next: (res) => {
          if (res.status_login == "berhasil") {
            this.authService.saveData(res.token, res.username);
            this.username = '';
            this.password = '';
            this.router.navigateByUrl('/mahasiswa');
          } else {
            this.authService.notifikasi('Username atau Password Salah');
          }
        },
        error: (e) => {
          this.authService.notifikasi('Login Gagal Periksa Koneksi Internet Anda');
        }
      })
    } else {
      this.authService.notifikasi('Username atau Password Tidak Boleh Kosong');
    }
  }
```
Di atas ini adalah fungsi login(). Fungsinya untuk memeriksa apakah username dan password diisi. Jika diisi, data dikirim ke API. Jika berhasil, token dan username disimpan, lalu pengguna diarahkan ke halaman mahasiswa. Jika login gagal, notifikasi "Username atau Password Salah" ditampilkan. Jika ada kesalahan jaringan, notifikasi "Login Gagal Periksa Koneksi Internet Anda" akan muncul.


7. Tampilan halaman
- Halaman Login
```
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Login</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Login</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-item lines="full">
    <ion-label position="floating">Username</ion-label>
    <ion-input type="text" [(ngModel)]="username" required="required"></ion-input>
  </ion-item>
  <ion-item lines="full">
    <ion-label position="floating">Password</ion-label>
    <ion-input type="password" [(ngModel)]="password" required="required"></ion-input>
  </ion-item>
  <ion-row>
    <ion-col>
      <ion-button type="submit" color="primary" expand="block" (click)="login()">Login</ion-button>
    </ion-col>
  </ion-row>
</ion-content>
```
diatas adalah tampilan halaman login yang menampilkan 2 field form untuk user mengisikan username dan password. lalu terdapat satu tombol login untuk masuk ke halaman mahasiswa.

- Halaman Mahasiswa
```
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Welcome {{ namaUser }}, This is the Mahasiswa Data Page</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Data Mahasiswa</ion-title>
    </ion-toolbar>
  </ion-header>

  <hr>
  

  <!-- button tambah -->
  <ion-card>
    <ion-button (click)="openModalTambah(true)" expand="block">Add Data Mahasiswa</ion-button>
  </ion-card>
  <!-- modal tambah -->
  <ion-modal [isOpen]="modalTambah" (ionModalDidDismiss)="cancel()">
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button (click)="cancel()"><ion-icon name="close-outline"></ion-icon></ion-button>
          </ion-buttons>
          <ion-title>Add Data Mahasiswa</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input label="Nama Mahasiswa" labelPlacement="floating" required [(ngModel)]="namaMahasiswa"
            placeholder="Masukkan Nama Mahasiswa" type="text">
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input label='Jurusan Mahasiswa' labelPlacement="floating" required [(ngModel)]="jurusan"
            placeholder="Masukkan Jurusan Mahasiswa" type="text">
          </ion-input>
        </ion-item>
        <ion-row>
          <ion-col>
            <ion-button type="button" (click)="tambahMahasiswa()" color="primary" shape="full" expand="block">Add
              Mahasiswa
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-content>
    </ng-template>
  </ion-modal>
  <!-- ini untuk modal edit -->
  <ion-modal [isOpen]="modalEdit" (ionModalDidDismiss)="cancel()">
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button (click)="cancel()"><ion-icon name="close-outline"></ion-icon></ion-button>
          </ion-buttons>
          <ion-title>Edit Data Mahasiswa</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input label="Nama Mahasiswa" labelPlacement="floating" required [(ngModel)]="namaMahasiswa"
            placeholder="Masukkan Nama Mahasiswa" type="text">
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input label='Jurusan Mahasiswa' labelPlacement="floating" required [(ngModel)]="jurusan"
            placeholder="Masukkan Jurusan Mahasiswa" type="text">
          </ion-input>
        </ion-item>
        <ion-input required [(ngModel)]="id" type="hidden">
        </ion-input>
        <ion-row>
          <ion-col>
            <ion-button type="button" (click)="editMahasiswa()" color="primary" shape="full" expand="block">Edit
              Data Mahasiswa
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-content>
    </ng-template>
  </ion-modal>

  <ion-card *ngFor="let item of dataMahasiswa">
    <ion-item *ngIf="item && item.nama && item.jurusan">
      <ion-label>
        {{item.nama}}
        <p>{{item.jurusan}}</p>
      </ion-label>
      <ion-button color="warning" expand="block" (click)="openModalEdit(true,item.id)">
        Edit
      </ion-button>
      <ion-button color="danger" slot="end" (click)="konfirmasiHapus(item.id)">
        Delete
      </ion-button>  
    </ion-item>
  </ion-card>

  <ion-item (click)="logout()" style="margin-top: 30px;">
    <ion-icon slot="start" ios="exit-outline" md="exit-sharp"></ion-icon>
    <ion-label>Logout</ion-label>
  </ion-item>
</ion-content>
```
diatas adalah file tampilan untuk mahasiswa, pertama-tama terdapat tulisan header yang mengambil nama user. lalu terdapat button untuk create data mahasiswa. selanjutnya ada card yang akan menyesuaikan jumlah data dari database, pada tiap card dibagian kanan ada dua button untuk edit dan juga untuk delete. lalu dipaling bawah terdapat tombol untuk logout yang jika dipencet akan mengarahkan kemabali ke halaman login.


8. Guards
- auth.guard.ts
- auto-login.guard.ts

