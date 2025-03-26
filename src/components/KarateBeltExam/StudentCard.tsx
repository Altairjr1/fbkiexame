
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Student {
  id: number;
  name: string;
  age: string;
  club: string;
  specialCondition: string;
  belt: string;
  danStage: string;
}

interface StudentCardProps {
  student: Student;
  index: number;
  onChange: (id: number, field: keyof Student, value: string) => void;
  belts: string[];
}

const getBeltColorClass = (belt: string) => {
  switch(belt) {
    case "Amarela": return "belt-yellow";
    case "Vermelha": return "belt-red";
    case "Laranja": return "belt-orange";
    case "Verde": return "belt-green";
    case "Roxa": return "belt-purple";
    case "Marrom": return "belt-brown";
    case "Preta": return "belt-black";
    default: return "belt-white";
  }
};

export const StudentCard: React.FC<StudentCardProps> = ({ student, index, onChange, belts }) => {
  const animationDelay = `${index * 0.1}s`;
  const beltClass = getBeltColorClass(student.belt);

  return (
    <Card 
      className="overflow-hidden group hover:shadow-lg transition-all duration-300 animate-scale-in"
      style={{ animationDelay }}
    >
      <div className={cn("h-2 w-full transition-all duration-500 animate-belt-slide", beltClass)} 
           style={{ animationDelay: `${animationDelay + 0.2}s` }} />
      
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${student.id}`} className="text-sm font-medium opacity-80">
            Nome Completo
          </Label>
          <Input
            id={`name-${student.id}`}
            value={student.name}
            onChange={(e) => onChange(student.id, "name", e.target.value)}
            placeholder="Nome do Aluno"
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`age-${student.id}`} className="text-sm font-medium opacity-80">
              Idade
            </Label>
            <Input
              id={`age-${student.id}`}
              type="number"
              value={student.age}
              onChange={(e) => onChange(student.id, "age", e.target.value)}
              placeholder="Idade"
              className="form-input"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`club-${student.id}`} className="text-sm font-medium opacity-80">
              Clube
            </Label>
            <Input
              id={`club-${student.id}`}
              value={student.club}
              onChange={(e) => onChange(student.id, "club", e.target.value)}
              placeholder="Nome do Clube"
              className="form-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`special-${student.id}`} className="text-sm font-medium opacity-80">
            Condição Especial
          </Label>
          <Input
            id={`special-${student.id}`}
            value={student.specialCondition}
            onChange={(e) => onChange(student.id, "specialCondition", e.target.value)}
            placeholder="Se houver, caso contrário deixe em branco"
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`belt-${student.id}`} className="text-sm font-medium opacity-80">
              Faixa Atual
            </Label>
            <Select 
              value={student.belt} 
              onValueChange={(value) => onChange(student.id, "belt", value)}
            >
              <SelectTrigger id={`belt-${student.id}`} className="form-select">
                <SelectValue placeholder="Selecione a Faixa..." />
              </SelectTrigger>
              <SelectContent>
                {/* Remove the empty string value option and use a placeholder in SelectValue instead */}
                {belts.map((belt) => (
                  <SelectItem key={belt} value={belt}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getBeltColorClass(belt)}`} />
                      <span>{belt}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(student.belt === "Dans" || student.belt === "Estágio" || student.belt === "Preta") && (
            <div className="space-y-2">
              <Label htmlFor={`dan-${student.id}`} className="text-sm font-medium opacity-80">
                {student.belt === "Preta" ? "Dan" : 
                 student.belt === "Dans" ? "Número do Dan" : 
                 "Número do Estágio"}
              </Label>
              <Input
                id={`dan-${student.id}`}
                type="number"
                value={student.danStage}
                onChange={(e) => onChange(student.id, "danStage", e.target.value)}
                placeholder={`Número do ${student.belt === "Preta" ? "Dan" : 
                             student.belt === "Dans" ? "Dan" : "Estágio"}`}
                className="form-input"
                min="1"
                max={student.belt === "Preta" || student.belt === "Dans" ? "10" : "3"}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
