import React from 'react';
import { Ingresso } from '@/types/ingressos';
import { formatCPF, formatBirthDate } from '@/utils/formatters';

interface JogoInfo {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  total_ingressos: number;
  logo_adversario?: string;
  logo_flamengo?: string;
}

interface IngressosReportProps {
  ingressos: Ingresso[];
  jogoInfo: JogoInfo;
}