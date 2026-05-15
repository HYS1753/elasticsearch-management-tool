'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DictionaryTable } from '@/components/dictionary/dictionary-table';
import { DictionaryType } from '@/types/dictionary';
import { Book, GitBranch, Link as LinkIcon, SpellCheck, Ban } from 'lucide-react';

const DICTIONARY_INFO = {
  user: {
    title: 'User Dictionary',
    description: '사용자 정의 사전을 관리합니다. 형태소 분석 시 최우선으로 적용될 단어들을 정의합니다.',
    icon: Book,
  },
  decompound: {
    title: 'Decompound Dictionary',
    description: '복합명사 사전을 관리합니다. 복합어를 여러 개의 단일어로 분리하는 규칙을 정의합니다.',
    icon: GitBranch,
  },
  synonym: {
    title: 'Synonym Dictionary',
    description: '동의어 사전을 관리합니다. 검색어 확장 및 유의어 처리를 위한 단어 그룹을 정의합니다.',
    icon: LinkIcon,
  },
  correction: {
    title: 'Correction Dictionary',
    description: '오타 교정 사전을 관리합니다. 자주 틀리는 검색어를 올바른 단어로 교정하는 규칙을 정의합니다.',
    icon: SpellCheck,
  },
  stopword: {
    title: 'Stopword Dictionary',
    description: '불용어 사전을 관리합니다. 검색 결과에 영향을 주지 않는 무의미한 단어들을 필터링합니다.',
    icon: Ban,
  }
};

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="mt-1 ml-7 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export default function DictionaryPage() {
  const [activeTab, setActiveTab] = useState<DictionaryType>('user');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Dictionary Management"
          description="Manage analyzers, stopwords, synonyms, and custom dictionary entries"
        />

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as DictionaryType)}
          className="w-full space-y-8"
        >
          <TabsList className="bg-slate-100/80 p-1 flex-wrap h-auto w-full justify-start gap-2">
            {Object.entries(DICTIONARY_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {info.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="space-y-4">
            <SectionHeading 
              icon={DICTIONARY_INFO[activeTab].icon}
              title={DICTIONARY_INFO[activeTab].title}
              description={DICTIONARY_INFO[activeTab].description}
            />

            <TabsContent value="user" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="user" />
            </TabsContent>
            <TabsContent value="decompound" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="decompound" />
            </TabsContent>
            <TabsContent value="synonym" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="synonym" />
            </TabsContent>
            <TabsContent value="correction" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="correction" />
            </TabsContent>
            <TabsContent value="stopword" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="stopword" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
