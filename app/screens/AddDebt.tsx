import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  Percent,
  Hash
} from 'lucide-react-native';
import { getEntities, addEntity, addDebt } from '@/lib/database';
import { formatCurrency } from '@/lib/money';

interface Entity {
  id: number;
  kind: string;
  name: string;
}

export default function AddDebt() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [customEntityName, setCustomEntityName] = useState('');
  
  // Form fields
  const [debtKind, setDebtKind] = useState<string>('loan');
  const [principal, setPrincipal] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [apr, setApr] = useState('');
  const [feeFixed, setFeeFixed] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDay, setDueDay] = useState('');

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const entitiesData = await getEntities();
      setEntities(entitiesData);
    } catch (error) {
      console.error('Error loading entities:', error);
    }
  };

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowEntityModal(false);
  };

  const handleAddCustomEntity = async () => {
    if (!customEntityName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الجهة');
      return;
    }

    try {
      const entityId = await addEntity({
        kind: 'other',
        name: customEntityName.trim()
      });
      
      const newEntity = {
        id: entityId,
        kind: 'other',
        name: customEntityName.trim()
      };
      
      setSelectedEntity(newEntity);
      setCustomEntityName('');
      setShowEntityModal(false);
      await loadEntities();
    } catch (error) {
      console.error('Error adding entity:', error);
      Alert.alert('خطأ', 'حدث خطأ في إضافة الجهة');
    }
  };

  const calculateMissingField = () => {
    const principalNum = parseFloat(principal) || 0;
    const installmentNum = parseFloat(installmentAmount) || 0;
    const installmentsNum = parseInt(totalInstallments) || 0;

    if (principalNum > 0 && installmentNum > 0 && !totalInstallments) {
      setTotalInstallments(Math.ceil(principalNum / installmentNum).toString());
    } else if (principalNum > 0 && installmentsNum > 0 && !installmentAmount) {
      setInstallmentAmount((principalNum / installmentsNum).toFixed(3));
    } else if (installmentNum > 0 && installmentsNum > 0 && !principal) {
      setPrincipal((installmentNum * installmentsNum).toFixed(3));
    }
  };

  const handleSave = async () => {
    if (!selectedEntity) {
      Alert.alert('خطأ', 'يرجى اختيار الجهة');
      return;
    }

    if (!principal || !installmentAmount || !totalInstallments || !dueDay) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const dueDayNum = parseInt(dueDay);
    if (dueDayNum < 1 || dueDayNum > 31) {
      Alert.alert('خطأ', 'يوم الاستحقاق يجب أن يكون بين 1 و 31');
      return;
    }

    try {
      await addDebt({
        entity_id: selectedEntity.id,
        kind: debtKind,
        principal: parseFloat(principal),
        installment_amount: parseFloat(installmentAmount),
        total_installments: parseInt(totalInstallments),
        apr: parseFloat(apr) || 0,
        fee_fixed: parseFloat(feeFixed) || 0,
        start_date: startDate,
        due_day: dueDayNum,
      });

      Alert.alert('نجح', 'تم إضافة الالتزام بنجاح', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding debt:', error);
      Alert.alert('خطأ', 'حدث خطأ في إضافة الالتزام');
    }
  };

  const getEntityIcon = (kind: string) => {
    switch (kind) {
      case 'bank':
        return <Building2 size={20} color="#0B63FF" />;
      case 'bnpl':
      case 'retailer':
        return <CreditCard size={20} color="#28A745" />;
      case 'person':
        return <Users size={20} color="#FFAA00" />;
      default:
        return <DollarSign size={20} color="#6B7280" />;
    }
  };

  const debtKindOptions = [
    { key: 'loan', label: 'قرض' },
    { key: 'bnpl', label: 'تقسيط' },
    { key: 'friend', label: 'دين شخصي' },
    { key: 'oneoff', label: 'دفعة واحدة' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0F1724" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة التزام</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Entity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الجهة</Text>
          <TouchableOpacity
            style={styles.entitySelector}
            onPress={() => setShowEntityModal(true)}
          >
            {selectedEntity ? (
              <View style={styles.selectedEntity}>
                {getEntityIcon(selectedEntity.kind)}
                <Text style={styles.selectedEntityText}>{selectedEntity.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>اختر الجهة</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Debt Kind */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الالتزام</Text>
          <View style={styles.kindSelector}>
            {debtKindOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.kindOption,
                  debtKind === option.key && styles.selectedKindOption
                ]}
                onPress={() => setDebtKind(option.key)}
              >
                <Text
                  style={[
                    styles.kindOptionText,
                    debtKind === option.key && styles.selectedKindOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التفاصيل المالية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>المبلغ الأصلي (د.ك)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={principal}
                onChangeText={setPrincipal}
                placeholder="0.000"
                keyboardType="decimal-pad"
                onBlur={calculateMissingField}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>القسط الشهري (د.ك)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={installmentAmount}
                onChangeText={setInstallmentAmount}
                placeholder="0.000"
                keyboardType="decimal-pad"
                onBlur={calculateMissingField}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>عدد الأقساط</Text>
            <View style={styles.inputContainer}>
              <Hash size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={totalInstallments}
                onChangeText={setTotalInstallments}
                placeholder="12"
                keyboardType="number-pad"
                onBlur={calculateMissingField}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>يوم الاستحقاق</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={dueDay}
                onChangeText={setDueDay}
                placeholder="25"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Optional Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل إضافية (اختيارية)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الفائدة السنوية (%)</Text>
            <View style={styles.inputContainer}>
              <Percent size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={apr}
                onChangeText={setApr}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رسوم التأخير الثابتة (د.ك)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={feeFixed}
                onChangeText={setFeeFixed}
                placeholder="0.000"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ الالتزام</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Entity Selection Modal */}
      <Modal
        visible={showEntityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEntityModal(false)}>
              <Text style={styles.modalCancelText}>إلغاء</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اختيار الجهة</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.customEntityContainer}>
            <TextInput
              style={styles.customEntityInput}
              value={customEntityName}
              onChangeText={setCustomEntityName}
              placeholder="إضافة جهة جديدة"
            />
            <TouchableOpacity
              style={styles.addEntityButton}
              onPress={handleAddCustomEntity}
            >
              <Text style={styles.addEntityButtonText}>إضافة</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={entities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.entityOption}
                onPress={() => handleEntitySelect(item)}
              >
                {getEntityIcon(item.kind)}
                <Text style={styles.entityOptionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
    marginBottom: 12,
  },
  entitySelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedEntity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedEntityText: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#0F1724',
    marginLeft: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#9CA3AF',
  },
  kindSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kindOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedKindOption: {
    backgroundColor: '#0B63FF',
    borderColor: '#0B63FF',
  },
  kindOptionText: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
  },
  selectedKindOptionText: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#0F1724',
    paddingVertical: 16,
    paddingLeft: 12,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#0B63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#0B63FF',
  },
  customEntityContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  customEntityInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  addEntityButton: {
    backgroundColor: '#0B63FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addEntityButtonText: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#FFFFFF',
  },
  entityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entityOptionText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#0F1724',
    marginLeft: 12,
  },
});
