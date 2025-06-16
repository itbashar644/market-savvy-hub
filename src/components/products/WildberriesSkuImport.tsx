
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useDatabase';
import { Upload, Check, X } from 'lucide-react';

const WildberriesSkuImport = () => {
  const [skuData, setSkuData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappingResults, setMappingResults] = useState<{ success: string[]; failed: string[] } | null>(null);
  const { updateProduct, products } = useProducts();
  const { toast } = useToast();

  const defaultSkuData = `Y92.blue	161522133
y92.pink	178639222
x9.pro	166912392
x9.pro.pink	166912394
x9.pro.gray	166912395
x9.pro.gold	166912396
x8.se.gold	142211641
x8.se.black	142756863
x8.se.gray	166115887
x8.se.pink	142802370
x8.pro	105705227
x8.pro.gold	137203398
x8.pro.gray	159312631
x8.pro.pink	142811153
x8.mini	159256032
x8.mini.gold	159256327
x8.mini.gray	159256524
x8.mini.pink	159256261
proj.z2	212761255
proj.z1	212426976
proj.x9.white	212278917
proj.x9.black	287282205
proj.x8.white	171434312
proj.x8.pro.white	239389834
proj.x8.pro	208962983
proj.x8	171434339
proj.t8.white	198076575
proj.t8	198076576
proj.t6.white	198077506
proj.t6	198077505
proj.t10.white	250904065
proj.t10	250904064
proj.m20	212424940
proj.hy350.white	294817847
proj.hy350	293532494
proj.hy300.pro	293531831
proj.hy300	178859844
proj.f20	293528176
proj.f18	293529291
proj.06.white	279642002
proj.03.white	279641566
pad.wo9	204554459
pad.wo9.blue	204554460
pad.wo9.pink	204554461
pad.wo12	246266564
pad.wo12.blue	246266566
pad.wo12.green	246266565
pad.wo10	245355586
pad.wo10.white	245355587
pad.wo.pro	269489538
pad.wo.pro.silver	269489540
pad.wo.max	270410759
pad.wo.max.silver	270410760
pad.w&o.8	196155501
pad.w&o.8.blue	196155502
pad.w&o.8.gold	196155503
pad.s9.blue	244322489
pad.s9.gold	244322490
pad.s9.gray	244322491
pad.s25	270405643
pad.s25.blue	270405644
pad.s25.gold	270405645
pad.ozct.s25	315683212
pad.ozct.s25.blue	315683214
pad.ozct.s25.pink	315683213
pad.l8.oragne	214687683
pad.l8.green	214687684
pad.l23.gray	214693181
pad.l23.gold	214693179
pad.l23.blue	214693180
pad.l16.gray	249533667
pad.l16.blue	249533668
pad.iplay60	327543686
pad.iplay50	315682134
pad.a96.purple	196689264
pad.a96.blue	196689266
pad.a96.gold	196689267
pad.a96.gray	196689268
pad.a28.wathet	200620742
pad.a28.grey	200620740
pad.a28.blue	200620741
pad.a20.gold	302474627
pad.a20	279639284
pad.a15	279638505
pad.a15.blue	279638506
pad.a15.gold	279638507
pad.16.silver	189514825
pad.16.gray	189514826
pad.16.blue	189514827
pad.16.gold	189514828
pad.11.purple	214682528
pad.11.green	214682527
pad.11.gray	214682526
mob.x200.white	201792006
LK8.se.gray	159232245
LK8.se.gold	159219678
LK8.SE	159232079
LK8.Pro.Pink	161205472
LK8.Pro.Gray	161205473
LK8.Pro.Gold	161205474
LK8.Pro	159231673
LK8.mini.gray	159233134
LK8.mini.gold	159233624
LK8.mini	159232439
kids.pad.wo38.pink	274767413
kids.pad.wo38.grey	274767414
kids.pad.wo38.green	274767411
kids.pad.wo38.blue	274767412
kids.pad.wo32.pink	274696648
kids.pad.wo32.green	274696649
kids.pad.wo32.blue	274696647
kids.pad.wo.32.yellow	274696646
hk9.pro.red	172966231
hk9.pro.green	172966241
hk9.pro.gray	172966227
hk9.pro	172966226
hk4.silver	174297755
hk4.gold	176659131
hk4	174297754
gt4.max.silver	166911402
gt4.max	166910965
gamebox.tv	161516944
fiesta.4g	168974556
dt.ultra.mate.silver	160989787
dt.ultra.mate.blue	164135988
dt.ultra.mate	160989675
dt.8.red	148307246
dt.8.mini.pink	180177481
dt.8.mini.gray	160375824
dt.8.mini	160375221
dt.8.gray	150614374
dt.8.gold	147005968
dt.8	144650958
dt.3.gray	155337253
Dt.3.gold	152092938
dt.3	155336937
cam.q5.pink	272528906
cam.q5.blue	272528907
cam.ny	275172889
air.pro	161318945
air.pods.2	161379719`;

  React.useEffect(() => {
    setSkuData(defaultSkuData);
  }, []);

  const processSkuMapping = () => {
    setIsProcessing(true);
    setMappingResults(null);

    try {
      const lines = skuData.trim().split('\n');
      const success: string[] = [];
      const failed: string[] = [];

      lines.forEach(line => {
        const parts = line.trim().split('\t');
        if (parts.length !== 2) {
          failed.push(`Неверный формат: ${line}`);
          return;
        }

        const [internalSku, wbSku] = parts;
        const product = products.find(p => p.sku === internalSku);

        if (!product) {
          failed.push(`Товар не найден: ${internalSku}`);
          return;
        }

        const updated = updateProduct(product.id, { wildberries_sku: wbSku });
        if (updated) {
          success.push(`${internalSku} → ${wbSku}`);
        } else {
          failed.push(`Ошибка обновления: ${internalSku}`);
        }
      });

      setMappingResults({ success, failed });

      if (success.length > 0) {
        toast({
          title: "SKU Wildberries обновлены",
          description: `Успешно обновлено ${success.length} товаров${failed.length > 0 ? `, ${failed.length} ошибок` : ''}`,
        });
      }

    } catch (error) {
      console.error('Error processing SKU mapping:', error);
      toast({
        title: "Ошибка обработки",
        description: "Произошла ошибка при обработке данных SKU",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Импорт SKU Wildberries</span>
        </CardTitle>
        <CardDescription>
          Вставьте соответствие между внутренними артикулами и SKU Wildberries в формате: внутренний_sku [TAB] wb_sku
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={skuData}
          onChange={(e) => setSkuData(e.target.value)}
          placeholder="x8.se.gray	166115887&#10;x8.mini	159256032&#10;..."
          className="min-h-[200px] font-mono text-sm"
        />

        <Button 
          onClick={processSkuMapping}
          disabled={isProcessing || !skuData.trim()}
          className="w-full"
        >
          {isProcessing ? 'Обработка...' : 'Обновить SKU Wildberries'}
        </Button>

        {mappingResults && (
          <div className="space-y-4 mt-4">
            {mappingResults.success.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 flex items-center space-x-1 mb-2">
                  <Check className="w-4 h-4" />
                  <span>Успешно обновлено ({mappingResults.success.length})</span>
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  {mappingResults.success.slice(0, 10).map((item, index) => (
                    <div key={index} className="font-mono">{item}</div>
                  ))}
                  {mappingResults.success.length > 10 && (
                    <div className="text-green-600">... и ещё {mappingResults.success.length - 10}</div>
                  )}
                </div>
              </div>
            )}

            {mappingResults.failed.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 flex items-center space-x-1 mb-2">
                  <X className="w-4 h-4" />
                  <span>Ошибки ({mappingResults.failed.length})</span>
                </h4>
                <div className="text-sm text-red-700 space-y-1">
                  {mappingResults.failed.slice(0, 10).map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                  {mappingResults.failed.length > 10 && (
                    <div className="text-red-600">... и ещё {mappingResults.failed.length - 10}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WildberriesSkuImport;
