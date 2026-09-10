-- Corrige um erro de design: um setor pode (e normalmente deve) ter mais de um
-- dispositivo - um sensor e uma valvula, por exemplo - entao nao faz sentido
-- exigir "um dispositivo por setor". Essa regra impedia salvar a segunda
-- entrada (ex: a valvula) quando o sensor ja usava o mesmo setor.
-- Rode em: Supabase Dashboard > SQL Editor > New query > Run.
drop index if exists devices_owner_setor_unique;
