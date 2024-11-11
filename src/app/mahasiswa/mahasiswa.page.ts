import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { ModalController, AlertController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mahasiswa',
  templateUrl: './mahasiswa.page.html',
  styleUrls: ['./mahasiswa.page.scss'],
})
export class MahasiswaPage implements OnInit {
  dataMahasiswa: any;
  modalTambah: any;
  id: any;
  namaMahasiswa: any;
  jurusan: any;
  modalEdit: any;
  namaUser: any;

  resetModal() {
    this.id = null;
    this.namaMahasiswa = '';
    this.jurusan = '';
  }
  
  openModalTambah(isOpen: boolean) {
    this.modalTambah = isOpen;
    this.resetModal();
    this.modalTambah = true;
    this.modalEdit = false;
  }

  openModalEdit(isOpen: boolean, idget: any) {
    this.modalEdit = isOpen;
    this.id = idget;
    console.log(this.id);
    this.ambilMahasiswa(this.id);
    this.modalTambah = false;
    this.modalEdit = true;
  }

  cancel() {
    this.modal.dismiss();
    this.modalTambah = false;
    this.modalEdit = false;
    this.resetModal();
  }

  constructor(private api: ApiService, private modal: ModalController, private alertController: AlertController, private authService: AuthenticationService, private router: Router) { this.namaUser = this.authService.nama }

  ngOnInit() {
    this.getMahasiswa();
  }

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