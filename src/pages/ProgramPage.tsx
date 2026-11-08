import React from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { ProgramView } from '../components/Program';
import { canonicalBodyPartId, getProgramForBodyPart } from '../data/exercises';
import { usePageMeta } from '../hooks/usePageMeta';
import { MessagePage } from './MessagePage';

export const ProgramPage: React.FC = () => {
  const { bodyPartId = '' } = useParams<{ bodyPartId: string }>();
  const navigate = useNavigate();
  const program = getProgramForBodyPart(bodyPartId);
  usePageMeta(program ? undefined : 'Program not found');

  if (!program) {
    return (
      <MessagePage title="Body Part Not Found">
        The requested body part &ldquo;{bodyPartId}&rdquo; does not exist.
      </MessagePage>
    );
  }

  const canonical = canonicalBodyPartId(bodyPartId);
  if (canonical && canonical !== bodyPartId) return <Navigate to={`/program/${canonical}`} replace />;

  return <ProgramView program={program} onBack={() => navigate('/')} />;
};
