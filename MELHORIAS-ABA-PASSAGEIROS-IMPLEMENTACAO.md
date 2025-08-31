# 🚀 Melhorias - Aba Passageiros

## 🎯 **MELHORIAS SOLICITADAS**

### **1. 🚌 Remover Responsáveis dos Ônibus**
- **Objetivo**: Simplificar a gestão removendo a funcionalidade de responsáveis
- **Ação**: Remover campos e lógica relacionada a `is_responsavel_onibus`

### **2. 🎢 Melhorar Passeios da Viagem (com Valores)**
- **Objetivo**: Aprimorar a exibição dos passeios com informações mais detalhadas
- **Ação**: Expandir informações de valores, participantes, status

---

## 🔧 **IMPLEMENTAÇÃO**

### **📋 FASE 1 - Remoção de Responsáveis dos Ônibus**

#### **1.1 Arquivos a Modificar:**
- `src/components/detalhes-viagem/PassageirosCard.tsx`
- `src/components/detalhes-viagem/PassageiroRow.tsx`
- `src/components/detalhes-viagem/PassageiroDialog.tsx`
- `src/components/detalhes-viagem/PassageiroEditDialog.tsx`
- `src/components/detalhes-viagem/OnibusCards.tsx`

#### **1.2 Mudanças Específicas:**
```typescript
// REMOVER:
- Campo is_responsavel_onibus das queries
- Checkbox "Responsável pelo ônibus" nos formulários
- Badge "Responsável" na lista de passageiros
- Lógica de validação de responsável único
- Filtros por responsável
```

### **📊 FASE 2 - Melhorar Passeios da Viagem**

#### **2.1 Informações Expandidas:**
```typescript
// ADICIONAR:
- Total de participantes por passeio
- Receita total por passeio
- Status de pagamento dos passeios
- Breakdown de valores (pago vs pendente)
- Lista de participantes expandível
- Filtros por passeio
- Estatísticas de conversão
```

#### **2.2 Interface Melhorada:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>🎢 Passeios da Viagem (com Valores)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {passeios.map(passeio => (
        <Card key={passeio.nome}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{passeio.nome}</h4>
              <Badge>{passeio.participantes} pessoas</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receita:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(passeio.receita)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pago:</span>
                <span className="text-green-600">
                  {formatCurrency(passeio.pago)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendente:</span>
                <span className="text-red-600">
                  {formatCurrency(passeio.pendente)}
                </span>
              </div>
              <Progress 
                value={(passeio.pago / passeio.receita) * 100} 
                className="h-2"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => expandirPasseio(passeio)}
            >
              Ver Participantes ({passeio.participantes})
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## 🎯 **VAMOS IMPLEMENTAR?**

Qual melhoria você gostaria que eu implemente primeiro?

1. **🚌 Remover Responsáveis dos Ônibus** - Limpeza e simplificação
2. **🎢 Melhorar Passeios da Viagem** - Interface mais rica e informativa

Ou prefere que eu implemente as duas ao mesmo tempo?