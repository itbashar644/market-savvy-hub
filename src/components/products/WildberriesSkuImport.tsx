
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWildberriesStock } from '@/hooks/database/useWildberriesStock';
import { Upload, Check, X, Search, AlertTriangle } from 'lucide-react';

const WildberriesSkuImport = () => {
  const [skuData, setSkuData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappingResults, setMappingResults] = useState<{ success: string[]; failed: string[] } | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { stockItems, bulkUpdateFromSkuMapping, loading } = useWildberriesStock();
  const { toast } = useToast();

  const newSkuData = `Y92.blue	2037853921662
y92.pink	2038677640067
x9.pro	2038095662931
x9.pro.pink	2038095669701
x9.pro.gray	2038095675313
x9.pro.gold	2038095684933
x8.se.gold	98324948
x8.se.black	98789712938
x8.se.gray	2038065362403
x8.se.pink	2037365517797
x8.pro	3475179825125
x8.pro.gold	865467754
x8.pro.gray	2037770731351
x8.pro.pink	2037365625225
x8.mini	2037768580237
x8.mini.gold	2037768587014
x8.mini.gray	2037768590298
x8.mini.pink	2037768583689
proj.z2	2039558300155
proj.z1	2039558286923
proj.x9.white	2039554707477
proj.x9.black	2041925362307
proj.x8.white	2038263544670
proj.x8.pro.white	2040484577924
proj.x8.pro	2039480037860
proj.x8	2038263535838
proj.t8.white	2039237565875
proj.t8	2039237577519
proj.t6.white	2039237609364
proj.t6	2039237578813
proj.t10.white	2040886937265
proj.t10	2040886941156
proj.m20	2039558279062
proj.hy350.white	2042102771264
proj.hy350	2042074471162
proj.hy300.pro	2042074441509
proj.hy300	2038683793290
proj.f20	2042074348204
proj.f18	2042074412271
proj.06.white	2041714255773
proj.03.white	2041714232781
pad.wo9	2039403437654
pad.wo9.blue	2039403447523
pad.wo9.pink	2039403454644
pad.wo12	2040744306646
pad.wo12.blue	2040744309616
pad.wo12.green	2040744308992
pad.wo10	2040707642736
pad.wo10.white	2040707645393
pad.wo.pro	2041437993990
pad.wo.pro.silver	2041438001663
pad.wo.max	2041456400189
pad.wo.max.silver	2041456409007
pad.w&o.8	2039164531134
pad.w&o.8.blue	2039164571017
pad.w&o.8.gold	2039164583836
pad.s9.blue	2040677672030
pad.s9.gold	2040677700139
pad.s9.gray	2040677703543
pad.s25	2041456250784
pad.s25.blue	2041456282334
pad.s25.gold	2041456316312
pad.ozct.s25	2042560078448
pad.ozct.s25.blue	2042560085002
pad.ozct.s25.pink	2042560083145
pad.l8.oragne	2039605612187
pad.l8.green	2039605612101
pad.l23.gray	2039605679746
pad.l23.gold	2039605632079
pad.l23.blue	2039605691267
pad.l16.gray	2040834730481
pad.l16.blue	2040834733932
pad.iplay60	2042560072958
pad.iplay50	2042560066827
pad.a96.purple	2039184641370
pad.a96.blue	2039184651881
pad.a96.gold	2039184667103
pad.a96.gray	2039184681826
pad.a28.wathet	2039318828523
pad.a28.grey	2039318812294
pad.a28.blue	2039318824600
pad.a20.gold	2042251214872
pad.a20	279639284
pad.a15.gold	2041714208670
pad.a15.blue	2041714207239
pad.a15	2041714204665
pad.16.silver	2038978575556
pad.16.gray	2038978601293
pad.16.blue	2038978606335
pad.16.gold	2038978612626
pad.11.purple	2039605508374
pad.11.green	2039605506974
pad.11.gray	2039605478936
mob.x200.white	2039339734759
LK8.se.gray	2037767875167
LK8.se.gold	2037767490247
LK8.SE	2037767869616
LK8.Pro.Pink	2037846311791
LK8.Pro.Gray	2037846271262
LK8.Pro.Gold	2037846276014
LK8.Pro	2037767862013
LK8.mini.gray	2037767885074
LK8.mini.gold	2037767890061
LK8.mini	2037767877772
kids.pad.wo38.pink	2041569703160
kids.pad.wo38.grey	2041569707434
kids.pad.wo38.green	2041569688313
kids.pad.wo38.blue	2041569697599
kids.pad.wo32.pink	2041569621204
kids.pad.wo32.green	2041569680478
kids.pad.wo32.blue	2041569614404
kids.pad.wo.32.yellow	2041569608762
hk9.pro.red	2038350885280
hk9.pro.green	2038350877179
hk9.pro.gray	2038350892172
hk9.pro	2038350895173
hk4.silver	2038473296505
hk4.gold	2038605093552
hk4	2038473293719
gt4.max.silver	2038095640649
gt4.max	2038095623499
gamebox.tv	2037853834108
fiesta.4g	2038157549644
dt.ultra.mate.silver	2037836004443
dt.ultra.mate.blue	2037962927777
dt.ultra.mate	2037835999306
dt.8.red	2037516096584
dt.8.mini.pink	2038726602275
dt.8.mini.gray	2037811890719
dt.8.mini	2037811861863
dt.8.gray	2037579458657
dt.8.gold	2037480225911
dt.8	2037415082145
dt.3.gray	2037684325660
Dt.3.gold	2037610909896
dt.3	2037684313797
cam.q5.pink	2041508074788
cam.q5.blue	2041508149271
cam.ny	2041589280948
air.pro	2037849078165
air.pods.2	2037849707485`;

  React.useEffect(() => {
    setSkuData(newSkuData);
  }, []);

  const processSkuMapping = async () => {
    if (loading) {
      toast({
        title: "⏳ Подождите",
        description: "Остатки WB еще загружаются из базы данных...",
        variant: "default",
      });
      return;
    }

    setIsProcessing(true);
    setMappingResults(null);

    try {
      const lines = skuData.trim().split('\n');
      const success: string[] = [];
      const failed: string[] = [];

      console.log('🔍 [SKU IMPORT] НАЧАЛО ИМПОРТА SKU В WILDBERRIES_STOCK');
      console.log('🔍 [SKU IMPORT] Строк для обработки:', lines.length);
      
      const skuMappings: Array<{ internal_sku: string; wildberries_sku: string }> = [];

      lines.forEach((line, index) => {
        const parts = line.trim().split('\t');
        if (parts.length !== 2) {
          failed.push(`Строка ${index + 1}: Неверный формат: ${line}`);
          return;
        }

        const [internalSku, wbSku] = parts;
        const cleanWbSku = wbSku.split(';')[0].trim();
        
        console.log(`🔍 [SKU IMPORT] Строка ${index + 1}: "${internalSku}" -> "${cleanWbSku}"`);
        
        skuMappings.push({
          internal_sku: internalSku,
          wildberries_sku: cleanWbSku
        });
        
        success.push(`${internalSku} → ${cleanWbSku}`);
      });

      // Массовое обновление через хук - теперь с подтягиванием остатков
      if (skuMappings.length > 0) {
        console.log('📦 [SKU IMPORT] Отправляем массовое обновление с подтягиванием остатков:', skuMappings.length);
        await bulkUpdateFromSkuMapping(skuMappings);
      }

      setMappingResults({ success, failed });

      console.log('📊 [SKU IMPORT] ИТОГИ:', { 
        успешно: success.length, 
        ошибок: failed.length,
        общий_процент: Math.round((success.length / (success.length + failed.length)) * 100) + '%'
      });

      if (success.length > 0) {
        toast({
          title: "✅ SKU Wildberries обновлены с остатками!",
          description: `Успешно обновлено ${success.length} SKU с подтягиванием остатков из inventory${failed.length > 0 ? `, ${failed.length} ошибок` : ''}`,
        });
      } else {
        toast({
          title: "⚠️ Не удалось обновить SKU",
          description: `Все ${failed.length} попыток завершились ошибкой. Проверьте формат данных.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 [SKU IMPORT] КРИТИЧЕСКАЯ ОШИБКА:', error);
      toast({
        title: "Ошибка обработки",
        description: "Произошла ошибка при обработке данных SKU",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
    if (!showDebugInfo) {
      console.log('🔍 [DEBUG] ОТЛАДОЧНАЯ ИНФОРМАЦИЯ О WILDBERRIES ОСТАТКАХ:');
      console.log('📋 Всего остатков WB:', stockItems.length);
      console.log('⏳ Загрузка:', loading);
      
      if (stockItems.length > 0) {
        console.log('📋 Первые 20 остатков WB:');
        stockItems.slice(0, 20).forEach((item, i) => {
          console.log(`  ${i + 1}. Internal SKU: "${item.internal_sku}", WB SKU: "${item.wildberries_sku}", Остаток: ${item.stock_quantity}`);
        });
      }
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
          Импортируйте SKU Wildberries с автоматическим подтягиванием остатков из inventory.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={toggleDebugInfo}
            className="flex items-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Показать остатки WB ({stockItems.length})</span>
          </Button>
          
          <Button 
            onClick={processSkuMapping}
            disabled={isProcessing || !skuData.trim() || loading}
            className="flex-1"
          >
            {isProcessing ? 'Импорт с остатками...' : loading ? 'Загрузка...' : 'Импортировать SKU + Остатки WB'}
          </Button>
        </div>

        {showDebugInfo && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Остатки WB в базе данных (первые 20 из {stockItems.length}):</span>
            </h4>
            <div className="text-sm text-blue-700 space-y-1 max-h-60 overflow-y-auto">
              {stockItems.slice(0, 20).map((item, index) => (
                <div key={index} className="font-mono text-xs p-2 bg-white rounded border">
                  <div><strong>#{index + 1}</strong></div>
                  <div><strong>Internal SKU:</strong> {item.internal_sku}</div>
                  <div><strong>WB SKU:</strong> <span className="text-green-600">{item.wildberries_sku}</span></div>
                  <div><strong>Остаток:</strong> <span className={item.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>{item.stock_quantity}</span></div>
                  <div><strong>Обновлен:</strong> {new Date(item.last_updated).toLocaleString('ru-RU')}</div>
                </div>
              ))}
              {stockItems.length > 20 && (
                <div className="text-blue-600 text-center pt-2">
                  <strong>... и ещё {stockItems.length - 20} остатков</strong>
                </div>
              )}
              <div className="mt-4 pt-2 border-t border-blue-200 bg-blue-100 p-2 rounded">
                <strong>Всего остатков WB: {stockItems.length}</strong>
              </div>
            </div>
          </div>
        )}

        <Textarea
          value={skuData}
          onChange={(e) => setSkuData(e.target.value)}
          placeholder="внутренний_sku [TAB] wb_sku&#10;..."
          className="min-h-[200px] font-mono text-sm"
        />

        {mappingResults && (
          <div className="space-y-4 mt-4">
            {mappingResults.success.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 flex items-center space-x-1 mb-2">
                  <Check className="w-4 h-4" />
                  <span>Успешно импортировано с остатками ({mappingResults.success.length})</span>
                </h4>
                <div className="text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                  {mappingResults.success.slice(0, 15).map((item, index) => (
                    <div key={index} className="font-mono text-xs">{item}</div>
                  ))}
                  {mappingResults.success.length > 15 && (
                    <div className="text-green-600">... и ещё {mappingResults.success.length - 15}</div>
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
                <div className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {mappingResults.failed.slice(0, 15).map((item, index) => (
                    <div key={index} className="text-xs">{item}</div>
                  ))}
                  {mappingResults.failed.length > 15 && (
                    <div className="text-red-600">... и ещё {mappingResults.failed.length - 15}</div>
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
