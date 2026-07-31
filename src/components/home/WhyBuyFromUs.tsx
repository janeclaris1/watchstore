import { CheckCircle, Truck, Star } from "lucide-react";

const FEATURES = [
  {
    icon: CheckCircle,
    title: "Brand-New Watches",
    description: "We only sell brand-new luxury watches from trusted supply channels.",
  },
  {
    icon: Truck,
    title: "Delivery After Payment",
    description: "Your watch is prepared and dispatched after successful payment confirmation.",
  },
  {
    icon: Star,
    title: "14-Day Returns",
    description: "Not completely satisfied? Return within 14 days for a full refund.",
  },
];

export function WhyBuyFromUs() {
  return (
    <section className="py-16 px-4 bg-wf-light">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-playfair text-3xl text-center mb-12">Why Buy From Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-wf-black mb-2">{feature.title}</h3>
              <p className="text-sm text-wf-gray leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
