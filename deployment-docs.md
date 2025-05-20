# Dokumentasi Deployment Aplikasi di AWS EC2

Dokumen ini menjelaskan langkah-langkah untuk men-deploy aplikasi web React dan backend Node.js di instans EC2 terpisah di AWS.

## Arsitektur Deployment

Aplikasi akan di-deploy dengan arsitektur sebagai berikut:
- **EC2 Instance 1**: Frontend React
- **EC2 Instance 2**: Backend Node.js
- **RDS MySQL**: Database untuk aplikasi

## Prasyarat

1. Akun AWS
2. Pengetahuan dasar tentang AWS EC2, Security Groups, dan RDS
3. SSH Client (Terminal untuk Linux/macOS atau PuTTY untuk Windows)
4. AWS CLI (opsional)

## Langkah 1: Menyiapkan Database MySQL di AWS RDS

1. Login ke AWS Management Console
2. Buka layanan RDS
3. Klik "Create database"
4. Pilih "MySQL"
5. Pilih versi MySQL 8.0
6. Pada bagian "Settings":
   - DB instance identifier: `cart-db`
   - Master username: `cart_user`
   - Master password: `[buat password yang kuat]`
7. Pilih ukuran instans yang sesuai (misalnya db.t3.micro untuk pengujian)
8. Pada bagian "Connectivity":
   - VPC: Pilih VPC default atau VPC yang Anda gunakan
   - Subnet group: Pilih atau buat subnet group baru
   - Public access: Yes (untuk kemudahan pengembangan, set No untuk produksi)
   - VPC security group: Create new
      - Nama: `cart-db-sg`
      - Aturan: Allow MySQL (port 3306) dari EC2 instances
9. Pada bagian "Additional configuration":
   - Initial database name: `cart_db`
10. Klik "Create database"
11. Catat endpoint RDS, username, dan password untuk konfigurasi aplikasi
12. Import init.sql dari web-app-node folder menggunakan dbeaver

## Langkah 2: Menyiapkan EC2 Instance untuk Backend Node.js

### Membuat EC2 Instance

1. Buka layanan EC2 di AWS Management Console
2. Klik "Launch Instance"
3. Pilih Ubuntu Server 22.04 LTS AMI
4. Pilih tipe instans (t2.micro untuk pengujian)
5. Konfigurasi detail instans:
   - Network: Pilih VPC yang sama dengan RDS
   - Auto-assign Public IP: Enable
6. Tambahkan penyimpanan (default 8GB sudah cukup)
7. Tambahkan tag (opsional): Key: `Name`, Value: `backend-node`
8. Konfigurasi Security Group:
   - Nama: `backend-sg`
   - Aturan:
     - SSH (port 22) dari IP Anda
     - HTTP (port 80) dari anywhere
     - Custom TCP (port 8080) dari anywhere
9. Review dan launch
10. Buat atau pilih key pair untuk SSH
11. Launch instance

### Menyiapkan Backend Node.js

1. Connect ke EC2 instance menggunakan SSH:
   ```
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. Update sistem dan install Node.js:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   
   sudo apt install -y nodejs git
   sudo apt install npm -y
   ```

3. Clone repositori aplikasi:
   ```bash
   sudo mkdir -p /var/www/web-app-node
   cd /var/www/web-app-node
   sudo git clone https://github.com/rizkiprass/web-app-node.git .
   # Atau upload kode secara manual menggunakan SCP/SFTP
   ```

4. Install dependensi:
   ```bash
   cd web-app-node
   sudo npm install
   ```

5. Buat file .env dengan konfigurasi yang benar:
sudo tee .env > /dev/null <<EOF
PORT=8080
NODE_ENV=production

# Database Configuration
DB_HOST=[RDS_ENDPOINT]
DB_USER=cart_user
DB_PASSWORD=[RDS_PASSWORD]
DB_NAME=cart_db
EOF


6. Install PM2 untuk menjalankan aplikasi sebagai service:
   ```bash
   sudo npm install -g pm2
   ```

7. Jalankan aplikasi dengan PM2:
   ```bash
   pm2 start index.js --name "backend"
   pm2 startup
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
   pm2 save
   ```

<!-- 8. (Opsional) Konfigurasi Nginx sebagai reverse proxy:
   ```bash
   sudo apt install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   
   sudo nano /etc/nginx/sites-available/backend
   ```
   
   Tambahkan konfigurasi berikut:
   ```
   server {
       listen 80;
       server_name _;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ``` -->

## Langkah 3: Menyiapkan EC2 Instance untuk Frontend React

### Membuat EC2 Instance

1. Buka layanan EC2 di AWS Management Console
2. Klik "Launch Instance"
3. Pilih Ubuntu Server 22.04 LTS AMI
4. Pilih tipe instans (t2.micro untuk pengujian)
5. Konfigurasi detail instans:
   - Network: Pilih VPC yang sama
   - Auto-assign Public IP: Enable
6. Tambahkan penyimpanan (default 8GB sudah cukup)
7. Tambahkan tag (opsional): Key: `Name`, Value: `frontend-react`
8. Konfigurasi Security Group:
   - Nama: `frontend-sg`
   - Aturan:
     - SSH (port 22) dari IP Anda
     - HTTP (port 80) dari anywhere
     - HTTPS (port 443) dari anywhere
9. Review dan launch
10. Gunakan key pair yang sama dengan backend
11. Launch instance

### Menyiapkan Frontend React

1. Connect ke EC2 instance menggunakan SSH:
   ```
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. Update sistem dan install Node.js:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs git
   ```

3. Clone repositori aplikasi:
   ```bash
   sudo mkdir -p /var/www/web-app-react
   cd /var/www/web-app-react
   sudo git clone https://github.com/rizkiprass/web-app-react.git .
   # Atau upload kode secara manual menggunakan SCP/SFTP
   ```

<!-- 4. Buat file konfigurasi untuk mengarahkan ke backend:
   ```bash
   cd web-app-react
   cat > .env << EOL
   REACT_APP_API_URL=http://[BACKEND_EC2_PUBLIC_IP]:8080/api
   EOL
   ``` -->

5. Install dependensi dan build aplikasi:
   ```bash
   sudo apt install npm -y
   sudo npm install
   sudo npm run build
   ```

6. Install dan konfigurasi Nginx untuk menyajikan aplikasi React:
   ```bash
   sudo apt install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   
   # Buat konfigurasi baru
   sudo vi /etc/nginx/sites-available/frontend
   ```
   
   Tambahkan konfigurasi berikut:
   ```
   server {
       listen 80;
       server_name _;
       root /var/www/web-app-react/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Berikan izin yang tepat:
   ```bash
   sudo chmod -R 755 /var/www/web-app-react/build
   ```

## Langkah 4: Konfigurasi CORS di Backend

1. Connect ke EC2 instance backend:
   ```
   ssh -i your-key.pem ubuntu@your-backend-ec2-public-ip
   ```

2. Edit file index.js untuk mengonfigurasi CORS:
   ```bash
   cd ~/app/web-app-node
   vi index.js
   ```

3. Update konfigurasi CORS:
   ```javascript
   // Middleware
   app.use(cors({
     origin: 'http://[FRONTEND_EC2_PUBLIC_IP]',
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

4. Restart aplikasi:
   ```bash
   pm2 restart backend
   ```

## Langkah 5: Pengujian

1. Akses frontend melalui browser:
   ```
   http://[FRONTEND_EC2_PUBLIC_IP]
   ```

2. Pastikan frontend dapat berkomunikasi dengan backend:
   - Coba login atau akses fitur yang memerlukan API
   - Periksa Network tab di browser developer tools untuk memastikan permintaan API berhasil

## Langkah 6: Konfigurasi Domain dan HTTPS (Opsional)

### Konfigurasi Domain

1. Daftarkan domain di Route 53 atau registrar domain lainnya
2. Buat record A di Route 53 yang mengarah ke IP publik EC2:
   - frontend.yourdomain.com → [FRONTEND_EC2_PUBLIC_IP]
   - api.yourdomain.com → [BACKEND_EC2_PUBLIC_IP]

### Konfigurasi HTTPS dengan Certbot

1. Install Certbot di kedua instance:
   ```bash
   sudo apt update
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Dapatkan sertifikat untuk frontend:
   ```bash
   sudo certbot --nginx -d frontend.yourdomain.com
   ```

3. Dapatkan sertifikat untuk backend:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

4. Update konfigurasi CORS di backend untuk menggunakan domain HTTPS:
   ```javascript
   app.use(cors({
     origin: 'https://frontend.yourdomain.com',
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

5. Update konfigurasi frontend untuk menggunakan API HTTPS:
   ```
   REACT_APP_API_URL=https://api.yourdomain.com/api
   ```

6. Rebuild frontend dan restart backend

## Pemeliharaan dan Monitoring

### Backup Database

1. Konfigurasi backup otomatis di RDS:
   - Buka konsol RDS
   - Pilih instans database
   - Klik "Modify"
   - Di bagian "Backup", atur periode retensi backup (misalnya 7 hari)
   - Klik "Continue" dan "Apply immediately"

### Monitoring

1. Aktifkan CloudWatch untuk monitoring EC2 dan RDS:
   - CPU Utilization
   - Memory Usage
   - Disk I/O
   - Network Traffic

2. Buat alarm untuk notifikasi ketika metrik melebihi ambang batas tertentu

### Update dan Maintenance

1. Update aplikasi:
   ```bash
   # Di EC2 frontend
   cd ~/app/web-app-react
   git pull
   npm install
   npm run build
   
   # Di EC2 backend
   cd ~/app/web-app-node
   git pull
   npm install
   pm2 restart backend
   ```

2. Update sistem operasi:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

## Troubleshooting

### Masalah Koneksi Database

1. Periksa Security Group RDS:
   - Pastikan port 3306 terbuka untuk EC2 backend

2. Periksa kredensial database di file .env

### Masalah CORS

1. Periksa konfigurasi CORS di backend
2. Periksa URL API di frontend

### Masalah Aplikasi Tidak Berjalan

1. Periksa log PM2:
   ```bash
   pm2 logs
   ```

2. Periksa log Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Kesimpulan

Dengan mengikuti langkah-langkah di atas, Anda telah berhasil men-deploy aplikasi web React dan backend Node.js di instans EC2 terpisah dengan database MySQL di RDS. Arsitektur ini memberikan pemisahan yang jelas antara frontend dan backend, memungkinkan penskalaan independen dan keamanan yang lebih baik.