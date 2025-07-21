import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, CreditCard, Bus, Calendar, Clock } from "lucide-react";
import { useRecentActivities } from "@/hooks/useRecentActivities";

export const RecentActivitiesCard = () => {
  const { activities, isLoading } = useRecentActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'trip':
        return <Bus className="w-4 h-4 text-purple-600" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: 'success' | 'pending' | 'failed') => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluído</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Falhou</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">{activity.title}</h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                    
                    {activity.user && (
                      <>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                          <Avatar className="h-4 w-4 mr-1">
                            {activity.user.avatar && <AvatarImage src={activity.user.avatar} />}
                            <AvatarFallback className="text-[8px]">{activity.user.initials}</AvatarFallback>
                          </Avatar>
                          {activity.user.name}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">Ver todas as atividades</a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};