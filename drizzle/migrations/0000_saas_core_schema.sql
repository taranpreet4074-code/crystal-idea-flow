-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Plans
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  billing_interval text NOT NULL DEFAULT 'month',
  monthly_generations integer NOT NULL DEFAULT 3,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.plans (id, name, description, price_cents, billing_interval, monthly_generations, features, sort_order) VALUES
('free','Free','Try the generator with a few stories each month',0,'month',3,
 '["3 AI story generations per month","Script, scenes and narration","Generation history"]'::jsonb,1),
('pro_monthly','Pro','For creators publishing every week',1900,'month',100,
 '["100 AI story generations per month","Scene-by-scene breakdown","Image and video prompts","Priority processing","Saved results","Download as text"]'::jsonb,2),
('pro_yearly','Pro Yearly','Everything in Pro, billed once a year',19000,'year',100,
 '["Everything in Pro","100 generations every month","Annual billing (2 months free)","Priority support"]'::jsonb,3);

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  plan_id text NOT NULL DEFAULT 'free' REFERENCES public.plans(id),
  is_disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id text NOT NULL DEFAULT 'free' REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Usage
CREATE TABLE public.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  generations_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);
GRANT SELECT ON public.usage TO authenticated;
GRANT ALL ON public.usage TO service_role;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON public.usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read usage" ON public.usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Generations
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  idea text NOT NULL,
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  status text NOT NULL DEFAULT 'completed',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own generations" ON public.generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own generations" ON public.generations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read generations" ON public.generations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Saved results
CREATE TABLE public.saved_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  generation_id uuid REFERENCES public.generations(id) ON DELETE SET NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_results TO authenticated;
GRANT ALL ON public.saved_results TO service_role;
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved results" ON public.saved_results FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'succeeded',
  description text,
  provider text NOT NULL DEFAULT 'stripe',
  provider_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Usage enforcement RPC (server-side, cannot be bypassed from the client)
CREATE OR REPLACE FUNCTION public.consume_generation_credit()
RETURNS TABLE (used integer, allowed integer, plan text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  period date := date_trunc('month', now())::date;
  v_plan text;
  v_allowed integer;
  v_used integer;
  v_disabled boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT p.plan_id, p.is_disabled INTO v_plan, v_disabled FROM public.profiles p WHERE p.id = uid;
  IF v_plan IS NULL THEN RAISE EXCEPTION 'profile_missing'; END IF;
  IF v_disabled THEN RAISE EXCEPTION 'account_disabled'; END IF;

  SELECT pl.monthly_generations INTO v_allowed FROM public.plans pl WHERE pl.id = v_plan;

  INSERT INTO public.usage (user_id, period_start, generations_used)
  VALUES (uid, period, 0) ON CONFLICT (user_id, period_start) DO NOTHING;

  SELECT u.generations_used INTO v_used FROM public.usage u
    WHERE u.user_id = uid AND u.period_start = period FOR UPDATE;

  IF v_used >= v_allowed THEN RAISE EXCEPTION 'limit_reached'; END IF;

  UPDATE public.usage u SET generations_used = u.generations_used + 1, updated_at = now()
    WHERE u.user_id = uid AND u.period_start = period
    RETURNING u.generations_used INTO v_used;

  RETURN QUERY SELECT v_used, v_allowed, v_plan;
END;
$$;
GRANT EXECUTE ON FUNCTION public.consume_generation_credit() TO authenticated;

CREATE OR REPLACE FUNCTION public.refund_generation_credit()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  period date := date_trunc('month', now())::date;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.usage SET generations_used = GREATEST(generations_used - 1, 0), updated_at = now()
    WHERE user_id = uid AND period_start = period;
END;
$$;
GRANT EXECUTE ON FUNCTION public.refund_generation_credit() TO authenticated;

-- Admin metrics
CREATE OR REPLACE FUNCTION public.admin_metrics()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'free_users', (SELECT count(*) FROM public.profiles WHERE plan_id = 'free'),
    'paid_users', (SELECT count(*) FROM public.profiles WHERE plan_id <> 'free'),
    'active_subscriptions', (SELECT count(*) FROM public.subscriptions WHERE status = 'active' AND plan_id <> 'free'),
    'mrr_cents', (SELECT COALESCE(SUM(CASE WHEN pl.billing_interval = 'year' THEN pl.price_cents / 12 ELSE pl.price_cents END), 0)
                   FROM public.subscriptions s JOIN public.plans pl ON pl.id = s.plan_id
                   WHERE s.status = 'active' AND s.plan_id <> 'free'),
    'total_generations', (SELECT count(*) FROM public.generations),
    'failed_payments', (SELECT count(*) FROM public.payments WHERE status = 'failed')
  ) INTO result;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;