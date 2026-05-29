const cases = Array.from({ length: 30 }).map((_, i) => {
  const n = i + 1;
  const items = [
    { stem: 'Algoritma: Dizide en büyük alt dizi toplamı (Kadane?)', ops: ['O(n^2)', 'Kadane O(n)', 'Böl ve fethet O(n log n)'], correct: 1 },
    { stem: 'Veri yapısı: LRU cache hangi yapı ile?', ops: ['HashMap+LinkedList', 'Queue', 'Stack'], correct: 0 },
    { stem: 'Concurrency: Deadlock koşullarından biri?', ops: ['Preemption', 'Circular wait', 'Statelessness'], correct: 1 },
    { stem: 'SQL: N+1 problemini azaltmak?', ops: ['JOIN/Include', 'Daha küçük sayfa', 'Index sil'], correct: 0 },
    { stem: 'HTTP: İdempotent metod?', ops: ['POST', 'PUT', 'PATCH'], correct: 1 },
    { stem: 'Big-O: İkili arama?', ops: ['O(n)', 'O(log n)', 'O(1)'], correct: 1 },
    { stem: 'Ağaç: BST silme karmaşıklığı?', ops: ['O(1)', 'O(log n) amortize', 'O(n)'], correct: 1 },
    { stem: 'Hash çakışması çözümü?', ops: ['Açık adresleme', 'Sabit tablolar', 'İndeks düşür'], correct: 0 },
    { stem: 'REST vs RPC?', ops: ['Kaynak temelli vs prosedür temelli', 'İkisi de aynıdır', 'Sadece GraphQL doğrudur'], correct: 0 },
    { stem: 'CAP teoremi?', ops: ['Consistency-Availability-Partition tolerance', 'Cache-API-Proxy', 'CPU-ALU-PSU'], correct: 0 },
  ];
  const c = items[i % items.length];
  return { id: `soft_${n.toString().padStart(2,'0')}`, ...c };
});

export default cases;


