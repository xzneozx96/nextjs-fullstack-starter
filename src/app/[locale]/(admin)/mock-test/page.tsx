'use client';

import Button from '@/components/ui/button/Button';
import { AcademicCapIcon, AngleLeftIcon, BookOpenIcon, FileEditIcon, MicrophoneIcon } from '@/icons';
import { motion } from 'framer-motion';
import { Check, Headphones } from 'lucide-react';
import { useState } from 'react';

type TestType = 'full' | 'skill';
type SkillType = 'speaking' | 'listening' | 'writing' | 'reading';

const CardOption = ({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      className={`relative px-6 py-10 rounded-lg border cursor-pointer transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
    </motion.div>
  );
};

export default function MockTestPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);

  const handleTestTypeSelect = (type: TestType) => {
    setSelectedTestType(type);
    if (type === 'full') {
      // Redirect to tests list
    } else {
      setStep(2);
    }
  };

  const handleSkillSelect = (skill: SkillType) => {
    setSelectedSkill(skill);
    // Redirect to skill test
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedSkill(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-20">
      {step === 1
        ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-gray-900">Test Preparation</h1>
                <p className="text-gray-500">Which type of test do you want to practice?</p>
              </div>

              <div className="space-y-6">
                <div>
                  {/* <h2 className="text-lg font-medium mb-4">What type of test do you want to do?</h2> */}
                  <div className="grid gap-4">
                    <CardOption
                      selected={selectedTestType === 'full'}
                      onClick={() => handleTestTypeSelect('full')}
                      icon={BookOpenIcon}
                      title="Full Test"
                      description="Complete IELTS simulation with all four skills"
                    />
                    <CardOption
                      selected={selectedTestType === 'skill'}
                      onClick={() => handleTestTypeSelect('skill')}
                      icon={AcademicCapIcon}
                      title="Skill Test"
                      description="Focus on practicing a specific skill"
                    />
                  </div>
                </div>

                {selectedTestType === 'full' && (
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="primary"
                      className="px-6"
                      onClick={() => handleTestTypeSelect('full')}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <div className="relative flex items-center gap-2">
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={goBack}
                    className="absolute -left-16 transition-colors rounded-full p-0 shadow-none"
                  >
                    <AngleLeftIcon className="size-4" />
                  </Button>
                  <h1 className="text-2xl font-semibold text-gray-900">Test Preparation</h1>
                </div>
                <p className="text-gray-500">Please select which skill you want to practice</p>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Which skill do you want to practice?</h2>
                <div className="grid gap-4">
                  {[
                    { skill: 'speaking', icon: MicrophoneIcon, description: 'Practice speaking tasks and improve fluency' },
                    { skill: 'listening', icon: Headphones, description: 'Improve listening comprehension skills' },
                    { skill: 'writing', icon: FileEditIcon, description: 'Develop academic and general writing skills' },
                    { skill: 'reading', icon: BookOpenIcon, description: 'Enhance reading strategies and comprehension' },
                  ].map(({ skill, icon, description }) => (
                    <CardOption
                      key={skill}
                      selected={selectedSkill === skill}
                      onClick={() => handleSkillSelect(skill as SkillType)}
                      icon={icon}
                      title={skill.charAt(0).toUpperCase() + skill.slice(1)}
                      description={description}
                    />
                  ))}
                </div>

                {selectedSkill && (
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="primary"
                      className="px-6"
                      onClick={() => handleSkillSelect(selectedSkill)}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
    </div>
  );
}
