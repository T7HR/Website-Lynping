import { PageHeader } from "@/components/PageHeader";

const rules = [
  "ปิดประมูลตามเวลา เช่น ปิด 21:00 บิดเวลา 21:00 นับ บิดเวลา 21:01 ไม่นับ",
  "ลงบิดแล้วห้ามลบบิดทุกกรณี ไม่สนคำอ้าง พิมพ์ผิด ไม่เอาแล้ว หรือเปลี่ยนใจ",
  "สามารถแก้ไขบิดได้หากยังไม่มีคนมาบิดต่อหลังจากที่ลงบิดไป",
  "ผู้ชนะประมูลไม่รับของภายใน 24 ชม. หลังปิดประมูล มีโทษ Blacklist",
  "การลงบิดเป็นแบบบิดทบ เช่น บิดทีละ 10k จะลง 150k ได้ถ้าลงตัวตามกติกา",
  "ผู้ชนะประมูลต้องมารับของตาม Server ที่ร้านกำหนด",
];

export default function RulesPage() {
  return (
    <div>
      <PageHeader title="กฎและข้อตกลง" description="หน้า Public สำหรับแสดงกติกาการลงบิดและเงื่อนไขร้าน" />
      <div className="card divide-y divide-white/10">
        {rules.map((rule, i) => <p key={rule} className="p-5"><b className="text-indigo-300">{i + 1}.</b> {rule}</p>)}
      </div>
    </div>
  );
}
