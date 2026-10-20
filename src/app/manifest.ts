import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ตารางปฏิบัติงานจิตอาสา กก.ตชด.23',
    short_name: 'จิตอาสา ตชด.23',
    description: 'ระบบจัดการและแสดงผลตารางปฏิบัติงานจิตอาสา',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}