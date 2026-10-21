import styles from "@/app/home.module.css";

export function HomeProductPreview({ english: en }: { english: boolean }) {
  return (
    <div className={styles.heroVisual} aria-label={en ? "Illustrative product workspace with example data" : "Ilustrasi workspace produk dengan data contoh"}>
      <div className={styles.workspace}>
        <div className={styles.workspaceHeader}><strong>ReTendance</strong><span>WORKSPACE</span><b aria-hidden="true">•••</b></div>
        <div className={styles.workspaceBody}>
          <aside className={styles.workspaceNav} aria-hidden="true"><b>{en ? "Overview" : "Ringkasan"}</b><span>{en ? "Attendance" : "Kehadiran"}</span><span>{en ? "Requests" : "Pengajuan"}</span><span>{en ? "Employees" : "Karyawan"}</span><span>{en ? "Settings" : "Pengaturan"}</span></aside>
          <div className={styles.workspaceMain}>
            <div className={styles.workspaceTop}><span>{en ? "YOUR COMPANY" : "PERUSAHAAN ANDA"}</span><span>{en ? "Today" : "Hari ini"} ↗</span></div>
            <h3>{en ? "A connected team." : "Tim yang terhubung."}</h3>
            <div className={styles.demoMetrics}><div><span>{en ? "PRESENT" : "HADIR"}</span><strong>24</strong></div><div><span>{en ? "LEAVE" : "IZIN / CUTI"}</span><strong>02</strong></div><div><span>{en ? "LOCATIONS" : "LOKASI"}</span><strong>03</strong></div></div>
            <div className={styles.demoTable}><div><span>{en ? "Team" : "Tim"}</span><span>Shift</span><span>Status</span></div>{(en ? ["Operations", "Administration", "Field team"] : ["Operasional", "Administrasi", "Lapangan"]).map((team,i)=><div key={team}><span>{team}</span><span>{["07:00–15:00","08:00–16:00","09:00–17:00"][i]}</span><span>{en ? "Present" : "Hadir"}</span></div>)}</div>
          </div>
        </div>
      </div>
      <div className={styles.visualNote}><strong>{en ? "From products to operations." : "Dari aplikasi ke operasional."}</strong><span>{en ? "One partner for your IT needs." : "Satu mitra untuk kebutuhan IT Anda."}</span></div>
      <p className={styles.demoCaption}>{en ? "Illustrative workspace · example data" : "Ilustrasi workspace · data contoh"}</p>
    </div>
  );
}
